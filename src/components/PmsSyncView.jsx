import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Play,
  Copy,
  Check,
  RotateCw,
  Loader2,
  X,
  Sliders,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import pmsService from '../services/pmsService'

export default function PmsSyncView() {
  const [connections, setConnections] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [secretModalData, setSecretModalData] = useState(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [syncingId, setSyncingId] = useState(null)
  const [retryingEventId, setRetryingEventId] = useState(null)

  // New Connection Form
  const [connName, setConnName] = useState('')
  const [connVendor, setConnVendor] = useState('mock')
  const [connBaseUrl, setConnBaseUrl] = useState('')
  const [connApiKey, setConnApiKey] = useState('')
  const [connEnabled, setConnEnabled] = useState(true)
  const [creatingConn, setCreatingConn] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const [connList, eventsData] = await Promise.all([
        pmsService.listConnections().catch(() => []),
        pmsService.listEvents({ limit: 50 }).catch(() => ({ items: [] })),
      ])

      setConnections(Array.isArray(connList) ? connList : connList?.data || [])
      setEvents(eventsData?.items || [])
    } catch (err) {
      console.warn('PMS data fetch error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Create Connection
  const handleCreateConnection = async (e) => {
    e.preventDefault()
    try {
      setCreatingConn(true)
      const payload = {
        name: connName.trim(),
        vendor: connVendor,
        isEnabled: connEnabled,
        config: connVendor === 'http' ? {
          baseUrl: connBaseUrl.trim(),
          apiKey: connApiKey.trim() || undefined,
        } : {},
      }
      await pmsService.createConnection(payload)
      showToast(`PMS Connection "${connName}" registered`)
      setIsCreateModalOpen(false)
      setConnName('')
      setConnBaseUrl('')
      setConnApiKey('')
      loadData(true)
    } catch (err) {
      alert(err.message || 'Failed to create PMS connection')
    } finally {
      setCreatingConn(false)
    }
  }

  // Toggle Connection Enable
  const handleToggleEnable = async (conn) => {
    try {
      await pmsService.updateConnection(conn.id, { isEnabled: !conn.isEnabled })
      showToast(`${conn.name} is now ${!conn.isEnabled ? 'Enabled' : 'Disabled'}`)
      loadData(true)
    } catch (err) {
      showToast(`Update failed: ${err.message}`)
    }
  }

  // Rotate Secret
  const handleRotateSecret = async (conn) => {
    if (!window.confirm(`Generate a new webhook secret for "${conn.name}"? The existing secret will be invalidated.`)) {
      return
    }
    try {
      const data = await pmsService.rotateSecret(conn.id)
      setSecretModalData({
        name: conn.name,
        secret: data.secret || data.webhookSecret || data,
      })
      loadData(true)
    } catch (err) {
      showToast(`Secret rotation failed: ${err.message}`)
    }
  }

  // Sync Now
  const handleSyncNow = async (conn) => {
    try {
      setSyncingId(conn.id)
      const result = await pmsService.syncNow(conn.id)
      showToast(`Reconciliation complete for ${conn.name}`)
      loadData(true)
    } catch (err) {
      showToast(`Sync failed: ${err.message}`)
    } finally {
      setSyncingId(null)
    }
  }

  // Retry Failed Event
  const handleRetryEvent = async (eventItem) => {
    try {
      setRetryingEventId(eventItem.id)
      await pmsService.retryEvent(eventItem.id)
      showToast(`Event #${eventItem.id} re-queued for processing`)
      loadData(true)
    } catch (err) {
      showToast(`Retry failed: ${err.message}`)
    } finally {
      setRetryingEventId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            HOTEL ENTERPRISE INTEGRATION
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            PMS Synchronization & Webhooks
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Two-way reservation reconciliation with Opera PMS, Cloudbeds, Mews, and webhook event queues
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>Add PMS Adapter</span>
          </button>
        </div>
      </div>

      {/* PMS Connections Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-bold text-base text-[#0B1F3A] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C9A227]" />
            <span>Active Property Management Adapters ({connections.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E7EB]">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#64748B]">Querying PMS adapters...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#E5E7EB]">
            <Server className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#0B1F3A]">No PMS Connections Configured</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              Connect your hotel PMS (e.g., Oracle Opera, Cloudbeds, or local mock adapter) to synchronize in-house guest stays and room assignments automatically.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 h-8 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Configure First Connection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((conn) => {
              const isSyncing = syncingId === conn.id
              return (
                <div
                  key={conn.id}
                  className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-[#C9A227] flex items-center justify-center font-bold text-sm shadow-xs">
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                            {conn.name}
                          </h3>
                          <span className="text-[11px] text-[#64748B] block mt-0.5 capitalize">
                            Vendor: {conn.vendor} • ID #{conn.id}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                          conn.isEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${conn.isEnabled ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                        <span>{conn.isEnabled ? 'Online' : 'Disabled'}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#64748B] bg-[#F9F9F7] p-3 rounded-xl border border-[#E5E7EB]/60">
                      <div className="flex justify-between">
                        <span>Last Sync:</span>
                        <span className="font-semibold text-[#0B1F3A]">
                          {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endpoint:</span>
                        <span className="font-mono text-[11px] text-[#0B1F3A] truncate max-w-[170px]">
                          {conn.config?.baseUrl || 'Direct Internal Engine'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3.5 mt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSyncNow(conn)}
                      disabled={isSyncing || !conn.isEnabled}
                      className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Trigger immediate in-house guest reconciliation"
                    >
                      {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-[#C9A227]" />}
                      <span>Sync Now</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRotateSecret(conn)}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-xs font-semibold transition-colors cursor-pointer"
                        title="Rotate Webhook Secret"
                      >
                        <Key className="w-3.5 h-3.5 text-[#C9A227]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleEnable(conn)}
                        className={`h-8 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          conn.isEnabled
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={conn.isEnabled ? 'Disable Connection' : 'Enable Connection'}
                      >
                        {conn.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* PMS Event Log Stream */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
              PMS Webhook & Event Audit Stream ({events.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B]">
            Inbound reservation lifecycle events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            Zero PMS webhook events logged. Incoming reservation webhooks will stream here live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F9F7] border-b border-[#E5E7EB] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Error / Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {events.map((ev) => {
                  const isRetrying = retryingEventId === ev.id
                  const isFailed = ev.status === 'failed'
                  const isSuccess = ev.status === 'processed' || ev.status === 'success'

                  return (
                    <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B1F3A]">
                        #{ev.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0B1F3A] capitalize">
                        {ev.eventType || ev.type || 'reservation_sync'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFailed
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span>{ev.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                        {ev.error || ev.message || 'Processed normally'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => handleRetryEvent(ev)}
                            disabled={isRetrying}
                            className="h-7 px-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
                            <span>Retry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add PMS Connection Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0B1F3A] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#ECC246]">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-white">
                    Add PMS Connection
                  </h3>
                  <p className="text-[11px] text-[#B5C7EA]">
                    Configure Property Management System adapter
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConnection} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                  Connection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oracle Opera Cloud / FrontDesk PMS"
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                  Vendor Type *
                </label>
                <select
                  value={connVendor}
                  onChange={(e) => setConnVendor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227] bg-white"
                >
                  <option value="mock">Local Mock PMS (Simulated Sandbox)</option>
                  <option value="http">HTTP Webhook / Remote REST API</option>
                </select>
              </div>

              {connVendor === 'http' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                      PMS Base URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://pms.hotel-enterprise.com/api/v1"
                      value={connBaseUrl}
                      onChange={(e) => setConnBaseUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                      API Authorization Key (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Bearer token or API Secret"
                      value={connApiKey}
                      onChange={(e) => setConnApiKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableConn"
                  checked={connEnabled}
                  onChange={(e) => setConnEnabled(e.target.checked)}
                  className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                />
                <label htmlFor="enableConn" className="text-xs font-semibold text-[#0B1F3A] cursor-pointer">
                  Activate connection immediately after creation
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingConn}
                  className="h-8 px-4 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {creatingConn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-[#C9A227]" />}
                  <span>Save Connection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Display Modal */}
      {secretModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden text-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] text-[#C9A227] flex items-center justify-center mx-auto mb-3 shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
              New PMS Webhook Secret
            </h3>
            <p className="text-xs text-red-600 font-medium mt-1 mb-4">
              This secret will only be displayed once. Store it securely in your PMS webhook settings.
            </p>

            <div className="bg-[#F9F9F7] border border-[#E5E7EB] p-3 rounded-xl mb-4 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#0B1F3A] break-all select-all text-left">
                {secretModalData.secret}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(String(secretModalData.secret))
                  setCopiedSecret(true)
                  setTimeout(() => setCopiedSecret(false), 2500)
                }}
                className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#0B1F3A] shrink-0 cursor-pointer"
                title="Copy secret"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>

            <button
              onClick={() => setSecretModalData(null)}
              className="w-full h-9 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              I have stored this secret safely
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
