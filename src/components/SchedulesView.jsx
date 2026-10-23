import React, { useState, useEffect } from 'react'
import {
  Plus,
  Lightbulb,
  Snowflake,
  Clock,
  Check,
  X,
  Zap,
  Sliders,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  History,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Cpu,
} from 'lucide-react'
import rulesService from '../services/rulesService'
import { onSocketEvent } from '../services/socket'

export default function SchedulesView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'schedule' | 'vacancy'

  // New Rule Form State
  const [formName, setFormName] = useState('')
  const [formRuleType, setFormRuleType] = useState('schedule') // 'schedule' | 'vacancy'
  const [formCron, setFormCron] = useState('0 23 * * *')
  const [formTime, setFormTime] = useState('23:00')
  const [formScope, setFormScope] = useState('all') // 'all' | 'floors' | 'roomTypes'
  const [formFloor, setFormFloor] = useState('1')
  const [formTrigger, setFormTrigger] = useState('unsold') // 'unsold' | 'no_presence'
  const [formDelayMinutes, setFormDelayMinutes] = useState(30)
  const [formClimateMode, setFormClimateMode] = useState('eco')
  const [formLightsOff, setFormLightsOff] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Rule State
  const [editingRule, setEditingRule] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDelay, setEditDelay] = useState(30)
  const [editTrigger, setEditTrigger] = useState('unsold')
  const [isUpdating, setIsUpdating] = useState(false)

  // Run History Drawer State
  const [runsDrawerRule, setRunsDrawerRule] = useState(null)
  const [runsList, setRunsList] = useState([])
  const [runsLoading, setRunsLoading] = useState(false)
  const [runsPage, setRunsPage] = useState(1)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch real rules from backend
  const fetchRules = async () => {
    try {
      setLoading(true)
      const params = {}
      if (typeFilter !== 'all') params.type = typeFilter
      const data = await rulesService.listRules(params)
      if (data && Array.isArray(data)) {
        setRules(data)
      } else if (data?.items) {
        setRules(data.items)
      }
    } catch (err) {
      console.warn('Fallback: could not load rules from backend:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [typeFilter])

  // Listen for real-time rule runs from backend
  useEffect(() => {
    const unsub = onSocketEvent('rule:run', ({ ruleId, run }) => {
      showToast(`Rule run completed: status ${run?.status || 'success'}`)
      fetchRules()
      if (runsDrawerRule && runsDrawerRule.id === ruleId) {
        loadRuns(ruleId, runsPage)
      }
    })
    return () => unsub()
  }, [runsDrawerRule, runsPage])

  // Toggle active state via PATCH /admin/rules/:ruleId
  const handleToggleActive = async (ruleId, currentEnabled) => {
    const targetState = !currentEnabled
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: targetState } : r))
    )

    try {
      await rulesService.setRuleEnabled(ruleId, targetState)
      showToast(`Rule ${targetState ? 'activated' : 'paused'}`)
    } catch (err) {
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: currentEnabled } : r))
      )
      showToast(`Failed to update rule: ${err.message}`)
    }
  }

  // Trigger immediate run via POST /admin/rules/:ruleId/run
  const handleRunNow = async (ruleId, ruleName) => {
    try {
      showToast(`Executing rule: "${ruleName}"...`)
      await rulesService.runRuleNow(ruleId)
      showToast(`Rule "${ruleName}" executed successfully`)
      fetchRules()
    } catch (err) {
      showToast(`Run failed: ${err.message}`)
    }
  }

  // Load Rule Runs History
  const loadRuns = async (ruleId, p = 1) => {
    try {
      setRunsLoading(true)
      const res = await rulesService.getRuleRuns(ruleId, { page: p, limit: 25 })
      setRunsList(res?.items || (Array.isArray(res) ? res : []))
    } catch (e) {
      console.warn('Failed to load rule runs:', e.message)
    } finally {
      setRunsLoading(false)
    }
  }

  const handleOpenRunsDrawer = (rule) => {
    setRunsDrawerRule(rule)
    setRunsPage(1)
    loadRuns(rule.id, 1)
  }

  // Handle form submission to create rule via POST /admin/rules
  const handleSaveSchedule = async (e) => {
    e.preventDefault()
    if (!formName.trim()) return

    setIsSubmitting(true)
    try {
      let payload
      if (formRuleType === 'schedule') {
        const [hour, minute] = formTime.split(':')
        const cronExpr = formCron.trim() || `${minute || '0'} ${hour || '23'} * * *`

        payload = {
          name: formName.trim(),
          type: 'schedule',
          cron: cronExpr,
          target: {
            scope: formScope,
            floors: formScope === 'floors' ? [Number(formFloor)] : undefined,
          },
          conditions: {
            occupancy: 'vacant',
          },
          actions: [
            ...(formClimateMode ? [{ type: 'set_climate', mode: formClimateMode }] : []),
            ...(formLightsOff ? [{ type: 'lights', on: false }] : []),
          ],
        }
      } else {
        payload = {
          name: formName.trim(),
          type: 'vacancy',
          target: {
            scope: 'all',
          },
          conditions: {
            trigger: formTrigger,
            delayMinutes: Number(formDelayMinutes) || 30,
          },
          actions: [
            { type: 'set_climate', mode: 'eco' },
          ],
        }
      }

      await rulesService.createRule(payload)
      showToast(`Automation rule "${formName}" created.`)
      setIsModalOpen(false)
      setFormName('')
      fetchRules()
    } catch (err) {
      alert(err.message || 'Failed to create automation rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit rule via PATCH /admin/rules/:ruleId
  const handleSaveEditRule = async (e) => {
    e.preventDefault()
    if (!editingRule) return
    try {
      setIsUpdating(true)
      const updates = {
        name: editName.trim(),
      }
      if (editingRule.type === 'vacancy') {
        updates.conditions = {
          trigger: editTrigger,
          delayMinutes: Number(editDelay),
        }
      }
      await rulesService.updateRule(editingRule.id, updates)
      showToast('Rule parameters updated.')
      setEditingRule(null)
      fetchRules()
    } catch (err) {
      alert(err.message || 'Failed to update rule')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-xl border border-white/10 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            AUTOMATION & ENERGY PRESERVATION (RELEASE 2)
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Automation Schedules & Eco Rules
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Automate night setbacks, vacant room eco setbacks, and zone lighting to drive down hospitality kilowatt overhead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRules}
            disabled={loading}
            className="btn-secondary text-xs h-9 w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs h-9"
          >
            <Plus className="w-4 h-4" />
            <span>New Schedule Rule</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="hotel-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Automation Rules' },
            { id: 'schedule', label: 'Cron Schedules' },
            { id: 'vacancy', label: 'Vacancy Triggers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#64748B] font-medium">
          {rules.length} configured rules
        </span>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="hotel-card py-16 text-center text-xs text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
            Loading automation rule engine...
          </div>
        ) : rules.length === 0 ? (
          <div className="hotel-card py-16 text-center">
            <Zap className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
              No Automation Rules Configured
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Click "New Schedule Rule" to create eco setbacks or scheduled sweeps.
            </p>
          </div>
        ) : (
          rules.map((rule) => {
            const isAc = rule.actions?.some((a) => a.type === 'set_climate') || rule.type === 'vacancy'
            const isEnabled = rule.isEnabled !== false

            let targetDesc = 'All rooms & suites'
            if (rule.target?.scope === 'floors') {
              targetDesc = `Floors: ${rule.target.floors?.join(', ') || '1'}`
            } else if (rule.type === 'vacancy') {
              targetDesc = `Continuous Vacancy (${rule.conditions?.trigger || 'unsold'} • ${rule.conditions?.delayMinutes || 30}m delay)`
            }

            const timingDesc = rule.cron
              ? `Cron UTC: ${rule.cron}`
              : rule.type === 'vacancy'
              ? 'Automatic Occupancy Sensor Engine'
              : 'Scheduled Sweep'

            return (
              <div
                key={rule.id}
                className="hotel-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isAc
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}
                  >
                    {isAc ? <Snowflake className="w-5 h-5 stroke-[2.2]" /> : <Lightbulb className="w-5 h-5 stroke-[2.2]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                        {rule.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          rule.type === 'vacancy' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {rule.type}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                      {targetDesc}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1 font-semibold text-[#0B1F3A]">
                        <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>{timingDesc}</span>
                      </span>

                      {rule.recentRuns?.[0] && (
                        <span className="text-[11px] text-gray-500">
                          Last run: {new Date(rule.recentRuns[0].occurredAt || rule.recentRuns[0].createdAt || Date.now()).toLocaleTimeString()} ({rule.recentRuns[0].status})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: History + Edit + Run Now + Toggle */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* Run History */}
                  <button
                    type="button"
                    onClick={() => handleOpenRunsDrawer(rule)}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                    title="View Run History Log"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Rule */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(rule)
                      setEditName(rule.name)
                      setEditDelay(rule.conditions?.delayMinutes || 30)
                      setEditTrigger(rule.conditions?.trigger || 'unsold')
                    }}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                    title="Edit Rule Parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Run Now */}
                  <button
                    type="button"
                    onClick={() => handleRunNow(rule.id, rule.name)}
                    className="btn-secondary text-xs py-1 px-2.5 h-8"
                    title="Execute rule immediately"
                  >
                    <Play className="w-3 h-3 text-[#C9A227] fill-[#C9A227]" />
                    <span>Run Now</span>
                  </button>

                  {/* Toggle Active */}
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(rule.id, isEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* CREATE RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#0B1F3A] text-white">
              <h3 className="font-headline font-bold text-base text-white">
                New Automation Rule
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0B1F3A] mb-1.5">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. Night Climate Setback Floor 2"
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1.5">
                    Rule Type *
                  </label>
                  <select
                    value={formRuleType}
                    onChange={(e) => setFormRuleType(e.target.value)}
                    className="hotel-input text-xs h-9"
                  >
                    <option value="schedule">Schedule (Time/Cron Trigger)</option>
                    <option value="vacancy">Vacancy (Presence/Occupancy)</option>
                  </select>
                </div>

                {formRuleType === 'schedule' ? (
                  <div>
                    <label className="block font-bold text-[#0B1F3A] mb-1.5">
                      Target Time (Local)
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="hotel-input text-xs h-9"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-[#0B1F3A] mb-1.5">
                      Trigger Event
                    </label>
                    <select
                      value={formTrigger}
                      onChange={(e) => setFormTrigger(e.target.value)}
                      className="hotel-input text-xs h-9"
                    >
                      <option value="unsold">Unsold (No active booking)</option>
                      <option value="no_presence">No Presence (IoT sensor zero occupancy)</option>
                    </select>
                  </div>
                )}
              </div>

              {formRuleType === 'schedule' && (
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1.5">
                    Cron Expression (UTC)
                  </label>
                  <input
                    type="text"
                    value={formCron}
                    onChange={(e) => setFormCron(e.target.value)}
                    placeholder="0 23 * * *"
                    className="hotel-input text-xs h-9 font-mono"
                  />
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Format: min hour day month weekday (in UTC).
                  </span>
                </div>
              )}

              {formRuleType === 'vacancy' && (
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1.5">
                    Delay Before Action (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formDelayMinutes}
                    onChange={(e) => setFormDelayMinutes(e.target.value)}
                    className="hotel-input text-xs h-9"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-[#F1F5F9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs h-9"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Automation Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#0B1F3A] text-white">
              <h3 className="font-headline font-bold text-base text-white">
                Edit Rule: {editingRule.name}
              </h3>
              <button onClick={() => setEditingRule(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0B1F3A] mb-1.5">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>

              {editingRule.type === 'vacancy' && (
                <>
                  <div>
                    <label className="block font-bold text-[#0B1F3A] mb-1.5">
                      Trigger
                    </label>
                    <select
                      value={editTrigger}
                      onChange={(e) => setEditTrigger(e.target.value)}
                      className="hotel-input text-xs h-9"
                    >
                      <option value="unsold">Unsold</option>
                      <option value="no_presence">No Presence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#0B1F3A] mb-1.5">
                      Delay Minutes
                    </label>
                    <input
                      type="number"
                      value={editDelay}
                      onChange={(e) => setEditDelay(Number(e.target.value))}
                      className="hotel-input text-xs h-9"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-[#F1F5F9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="btn-secondary text-xs h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary text-xs h-9"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update Rule</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RULE RUN HISTORY DRAWER */}
      {runsDrawerRule && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E7EB] flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#7587A7] uppercase block">
                  EXECUTION AUDIT LOG
                </span>
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                  {runsDrawerRule.name}
                </h3>
              </div>
              <button
                onClick={() => setRunsDrawerRule(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 text-xs">
              {runsLoading ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
                  Loading execution log...
                </div>
              ) : runsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  No past execution runs recorded yet for this rule.
                </div>
              ) : (
                runsList.map((run, i) => (
                  <div key={run.id || i} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#0B1F3A]">
                        {run.status === 'success' ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Success</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{run.status || 'Executed'}</span>
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(run.occurredAt || run.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B]">
                      Affected suites: {run.affectedRoomsCount || run.affectedSuites || 'All in target scope'}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => setRunsDrawerRule(null)}
                className="w-full btn-secondary text-xs h-9 justify-center"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
