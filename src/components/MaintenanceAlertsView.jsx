import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Wrench,
  BatteryCharging,
  Sliders,
  Check,
  PhoneCall,
  RefreshCw,
  Shield,
  Layers,
  X,
  Sparkles,
} from 'lucide-react'
import alertsService from '../services/alertsService'
import { onSocketEvent } from '../services/socket'

export default function MaintenanceAlertsView() {
  const [filter, setFilter] = useState('all') // 'all' | 'critical' | 'warning' | 'guest' | 'resolved'
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [resolvingAlertId, setResolvingAlertId] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState(null)
  const [selectedAlertDetail, setSelectedAlertDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [openCounts, setOpenCounts] = useState({ critical: 0, warning: 0, info: 0 })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch real alerts from backend
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filter === 'resolved') {
        params.status = 'resolved'
      } else if (filter === 'critical') {
        params.status = 'open'
        params.severity = 'critical'
      } else if (filter === 'warning') {
        params.status = 'open'
        params.severity = 'warning'
      } else if (filter === 'guest') {
        params.source = 'guest'
      }

      const res = await alertsService.listAlerts(params)
      if (res) {
        setAlerts(res.items || [])
        if (res.openCounts) {
          setOpenCounts(res.openCounts)
        }
      }
    } catch (err) {
      console.warn('Fallback alerts load:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [filter])

  // Listen to Socket.IO real-time events for alerts
  useEffect(() => {
    const unsubCreated = onSocketEvent('alert:created', (newAlert) => {
      showToast(`New Hardware Alert: ${newAlert.title || 'Device fault reported'}`)
      fetchAlerts()
    })
    const unsubUpdated = onSocketEvent('alert:updated', (updated) => {
      fetchAlerts()
    })

    return () => {
      unsubCreated()
      unsubUpdated()
    }
  }, [])

  // Open Resolve Note Modal
  const openResolveModal = (alert) => {
    setSelectedAlertForResolve(alert)
    setResolutionNote(
      alert.type === 'device_offline'
        ? 'Restored Wi-Fi link and verified adapter polling'
        : 'Replaced lock battery and tested mobile key unlock'
    )
    setIsResolveModalOpen(true)
  }

  // Resolve alert via PATCH /admin/alerts/:alertId
  const handleConfirmResolve = async (e) => {
    e.preventDefault()
    if (!selectedAlertForResolve) return

    const alertId = selectedAlertForResolve.id
    try {
      await alertsService.resolveAlert(alertId, resolutionNote)
      showToast(`Alert #${alertId} marked as resolved`)
      setIsResolveModalOpen(false)
      setSelectedAlertForResolve(null)
      fetchAlerts()
    } catch (err) {
      showToast(`Error resolving alert: ${err.message}`)
    }
  }

  // Filter alerts in view
  const displayAlerts = alerts.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'resolved') return a.status === 'resolved'
    if (filter === 'critical') return a.severity === 'critical' && a.status !== 'resolved'
    if (filter === 'warning') return a.severity === 'warning' && a.status !== 'resolved'
    return true
  })

  // Floor telemetry distribution counts
  const floorCounts = {
    1: alerts.filter((a) => (a.room?.floor === 1 || a.room?.floor?.number === 1) && a.status === 'open').length,
    2: alerts.filter((a) => (a.room?.floor === 2 || a.room?.floor?.number === 2) && a.status === 'open').length,
    3: alerts.filter((a) => (a.room?.floor === 3 || a.room?.floor?.number === 3) && a.status === 'open').length,
    4: alerts.filter((a) => (a.room?.floor === 4 || a.room?.floor?.number === 4) && a.status === 'open').length,
    5: alerts.filter((a) => (a.room?.floor === 5 || a.room?.floor?.number === 5) && a.status === 'open').length,
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-xl border border-white/10 animate-fade-in text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-[#FED255]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#B45309] uppercase block mb-1">
            HARDWARE TELEMETRY & INCIDENTS (RELEASE 1)
          </span>
          <h1 className="font-headline font-bold text-3xl text-[#0B1F3A] tracking-tight">
            Maintenance Alerts
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time lock batteries, offline devices, climate drift, and guest incident tickets
          </p>
        </div>

        {/* Refresh & Sync Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="h-10 px-4 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Alerts</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid (8 cols alerts, 4 cols telemetry) matching Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Filter Pills + Alert Cards List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Pills matching Screenshot 3 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#0B1F3A] border border-[#E5E7EB]'
              }`}
            >
              All Alerts ({alerts.length})
            </button>

            <button
              onClick={() => setFilter('critical')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'critical'
                  ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/30 shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#DC2626] border border-[#E5E7EB]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              <span>Critical ({openCounts.critical || 0})</span>
            </button>

            <button
              onClick={() => setFilter('warning')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'warning'
                  ? 'bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/30 shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#B45309] border border-[#E5E7EB]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              <span>Warning ({openCounts.warning || 0})</span>
            </button>

            <button
              onClick={() => setFilter('guest')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'guest'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-blue-800 border border-[#E5E7EB]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Guest Reported</span>
            </button>

            <button
              onClick={() => setFilter('resolved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'resolved'
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/30 shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#15803D] border border-[#E5E7EB]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Resolved</span>
            </button>
          </div>

          {/* Alert Cards List matching Screenshot 3 */}
          <div className="space-y-3">
            {displayAlerts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-[#0B1F3A]">All Hardware Systems Normal</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Zero active incidents matching the selected filter.
                </p>
              </div>
            ) : (
              displayAlerts.map((item) => {
                const isResolved = item.status === 'resolved'
                const isCrit = item.severity === 'critical'
                const roomNum = item.room?.number ? `Room ${item.room.number}` : 'Public Area'
                const deviceName = item.device?.name || item.type || 'Connected IoT Unit'
                const targetText = `${roomNum} • ${deviceName}`
                const timeText = item.firstSeenAt
                  ? new Date(item.firstSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Recent'

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isResolved
                        ? 'border-[#E5E7EB] opacity-75'
                        : isCrit
                        ? 'border-l-[4px] border-l-[#DC2626] border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(220,38,38,0.06)]'
                        : 'border-l-[4px] border-l-[#D97706] border-[#E5E7EB]'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          isResolved
                            ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                            : isCrit
                            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                            : 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]'
                        }`}
                      >
                        {isResolved ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3
                            className={`font-headline font-bold text-base ${
                              isResolved ? 'text-[#64748B] line-through' : 'text-[#0B1F3A]'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isResolved
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : isCrit
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : 'bg-[#FEF3C7] text-[#B45309]'
                            }`}
                          >
                            {isResolved ? 'Resolved' : item.severity}
                          </span>

                          {item.occurrenceCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                              {item.occurrenceCount}x
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                          {targetText} {item.message ? `• "${item.message}"` : ''}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-[#64748B]">
                          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>
                            {isResolved
                              ? `Resolved note: "${item.resolutionNote || 'Fixed by technician'}"`
                              : `Triggered ${timeText} • Dispatch alerted`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Details & Resolve Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            setDetailLoading(true)
                            const detail = await alertsService.getAlertDetail(item.id)
                            setSelectedAlertDetail(detail)
                          } catch (e) {
                            setSelectedAlertDetail(item)
                          } finally {
                            setDetailLoading(false)
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-xs font-semibold text-[#0B1F3A] transition-colors cursor-pointer"
                      >
                        Details
                      </button>

                      {!isResolved && (
                        <button
                          onClick={() => openResolveModal(item)}
                          className="px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F0FDF4] hover:border-[#BBF7D0] hover:text-[#16A34A] text-xs font-bold text-[#0B1F3A] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Floor Telemetry & Zero Alert State matching Screenshot 3 */}
        <div className="lg:col-span-4 space-y-6">
          {/* Floor Telemetry Panel matching Screenshot 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#C9A227]" />
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Floor Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                5 Zones Monitored
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { level: 'Floor 1 · Ground Floor', count: floorCounts[1] },
                { level: 'Floor 2 · Executive Suites', count: floorCounts[2] },
                { level: 'Floor 3 · Deluxe King', count: floorCounts[3] },
                { level: 'Floor 4 · Panorama Penthouse', count: floorCounts[4] },
                { level: 'Floor 5 · Horizon Villas', count: floorCounts[5] },
              ].map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between"
                >
                  <span className="font-semibold text-[#0B1F3A]">{f.level}</span>
                  {f.count > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {f.count} Active Alert{f.count > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Normal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Notice Card */}
          <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 shadow-sm border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5 text-[#FED255]" />
            </div>
            <h4 className="font-headline font-bold text-base text-white">
              Technician Dispatch Protocol
            </h4>
            <p className="text-xs text-[#CBD5E1] mt-1.5 leading-relaxed">
              When resolving hardware tickets, the system logs the resolution note in the audit trail (GET /admin/audit).
            </p>
          </div>
        </div>
      </div>

      {/* Resolve Note Modal */}
      {isResolveModalOpen && selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                  Resolve Incident Ticket #{selectedAlertForResolve.id}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {selectedAlertForResolve.title}
                </p>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F3A] mb-1.5">
                  Resolution Note (Required for Audit Log)
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe corrective action taken..."
                  className="hotel-input w-full p-3 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#64748B] hover:bg-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALERT DETAIL DRAWER */}
      {selectedAlertDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E7EB] flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#7587A7] uppercase block">
                  INCIDENT TICKET #{selectedAlertDetail.id}
                </span>
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                  {selectedAlertDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 text-xs">
              <div>
                <span className="font-bold text-[#64748B] block mb-1">Message / Fault Description</span>
                <p className="text-[#0B1F3A] bg-[#F9F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                  {selectedAlertDetail.message || 'No additional fault payload message recorded.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Severity</span>
                  <span className="font-bold uppercase text-red-600">{selectedAlertDetail.severity}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Source</span>
                  <span className="font-bold uppercase text-[#0B1F3A]">{selectedAlertDetail.source || 'device'}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Room</span>
                  <span className="font-bold text-[#0B1F3A]">
                    {selectedAlertDetail.room?.number ? `Room ${selectedAlertDetail.room.number}` : 'Public Area'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Status</span>
                  <span className="font-bold uppercase text-[#0B1F3A]">{selectedAlertDetail.status}</span>
                </div>
              </div>

              {selectedAlertDetail.device && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-[#0B1F3A] block">Linked Hardware Device</span>
                  <div className="text-[11px] text-[#64748B]">Name: {selectedAlertDetail.device.name}</div>
                  <div className="text-[11px] text-[#64748B]">Type: {selectedAlertDetail.device.type}</div>
                  <div className="text-[11px] font-mono text-[#64748B]">External ID: {selectedAlertDetail.device.externalId}</div>
                </div>
              )}

              {selectedAlertDetail.occurrences && selectedAlertDetail.occurrences.length > 0 && (
                <div>
                  <span className="font-bold text-[#0B1F3A] block mb-2">Occurrence History</span>
                  <div className="space-y-2">
                    {selectedAlertDetail.occurrences.map((occ, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>{occ.type || 'Telemetry ping'}</span>
                          <span>{new Date(occ.occurredAt || occ.timestamp || Date.now()).toLocaleTimeString()}</span>
                        </div>
                        {occ.payload && (
                          <pre className="text-[10px] text-gray-600 font-mono overflow-x-auto">
                            {JSON.stringify(occ.payload)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedAlertDetail(null)}
                className="w-full btn-secondary text-xs h-9 justify-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
