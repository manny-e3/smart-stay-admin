import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Key,
  LogIn,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import auditService from '../services/auditService'

export default function AuditLogView() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unlocks' | 'auth'
  const [actorType, setActorType] = useState('all') // 'all' | 'staff' | 'guest' | 'system'
  const [searchQuery, setSearchQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const loadAuditLogs = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const params = {
        page,
        limit: 50,
      }

      if (activeTab === 'unlocks') {
        params.action = 'room.unlock'
      } else if (activeTab === 'auth') {
        params.action = 'auth.'
      }

      if (actorType !== 'all') {
        params.actorType = actorType
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim()
      }
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate

      const res = await auditService.searchAudit(params)
      if (res) {
        setLogs(res.items || (Array.isArray(res) ? res : []))
        setTotalCount(res.total || (res.items ? res.items.length : 0))
      }
    } catch (err) {
      console.warn('Audit load error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [activeTab, actorType, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    loadAuditLogs()
  }

  const getActionBadge = (action = '') => {
    const act = typeof action === 'string' ? action : String(action || '')
    if (act.includes('unlock')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Key className="w-3 h-3 text-amber-600" />
          <span>DOOR UNLOCK</span>
        </span>
      )
    }
    if (act.startsWith('auth.')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <LogIn className="w-3 h-3 text-purple-600" />
          <span>AUTHENTICATION</span>
        </span>
      )
    }
    if (act.startsWith('request.')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <span>SERVICE TICKET</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase">
        <span>{act}</span>
      </span>
    )
  }

  const getActorBadge = (type = '') => {
    const actType = typeof type === 'string' ? type : String(type || '')
    const map = {
      staff: 'bg-[#0B1F3A]/5 text-[#0B1F3A]',
      guest: 'bg-[#C9A227]/10 text-[#0B1F3A]',
      system: 'bg-emerald-50 text-emerald-800',
    }
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${map[actType] || 'bg-gray-100 text-gray-700'}`}>
        {actType}
      </span>
    )
  }

  const renderActorName = (log) => {
    if (typeof log.actorName === 'string' && log.actorName) return log.actorName
    if (log.staff && typeof log.staff.name === 'string') return log.staff.name
    if (log.guest && typeof log.guest.name === 'string') return log.guest.name
    if (log.actor && typeof log.actor.name === 'string') return log.actor.name
    if (typeof log.actor === 'string') return log.actor
    if (log.staffId) return `Staff #${log.staffId}`
    if (log.guestId) return `Guest #${log.guestId}`
    return 'System'
  }

  const renderDetails = (log) => {
    if (typeof log.description === 'string' && log.description.trim()) {
      return <span className="text-xs text-[#0B1F3A]">{log.description}</span>
    }
    if (typeof log.details === 'string' && log.details.trim()) {
      return <span className="text-xs text-[#0B1F3A]">{log.details}</span>
    }
    if (log.details && typeof log.details === 'object') {
      if (log.details.method) {
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[#64748B]">Method:</span>
            <span className="font-bold text-[#0B1F3A] uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {String(log.details.method)}
            </span>
            {log.details.success !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${log.details.success ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                {log.details.success ? 'SUCCESS' : 'FAILED'}
              </span>
            )}
          </span>
        )
      }
      return <span className="font-mono text-[11px] text-[#64748B]">{JSON.stringify(log.details)}</span>
    }
    if (log.payload && typeof log.payload === 'object') {
      return <span className="font-mono text-[11px] text-[#64748B]">{JSON.stringify(log.payload)}</span>
    }
    if (typeof log.payload === 'string' && log.payload.trim()) {
      return <span className="text-xs text-[#0B1F3A]">{log.payload}</span>
    }
    return <span className="text-xs text-[#64748B]">Action recorded in telemetry stream</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            SECURITY TRAIL & REGULATORY COMPLIANCE
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Audit Trail & Activity Log
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable chronological logging of all room unlocks, staff sign-ins, device commands, and administrative modifications.
          </p>
        </div>

        <button
          onClick={() => loadAuditLogs(true)}
          disabled={refreshing}
          className="btn-secondary text-xs h-9 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="hotel-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Operations' },
              { id: 'unlocks', label: 'Room Unlocks' },
              { id: 'auth', label: 'Sign-In & Auth' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by room, actor, keyword..."
              className="hotel-input text-xs h-8 pl-8 pr-16"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 bg-[#0B1F3A] text-white rounded hover:bg-[#C9A227] transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Detailed Controls: Actor Type & Date Pickers */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">Actor Type:</span>
            <select
              value={actorType}
              onChange={(e) => {
                setActorType(e.target.value)
                setPage(1)
              }}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Actors</option>
              <option value="staff">Staff Members</option>
              <option value="guest">Hotel Guests</option>
              <option value="system">System Daemon</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="hotel-input text-xs h-8 w-auto py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="hotel-input text-xs h-8 w-auto py-1"
            />
          </div>

          {(fromDate || toDate || searchQuery) && (
            <button
              onClick={() => {
                setFromDate('')
                setToDate('')
                setSearchQuery('')
                setPage(1)
                loadAuditLogs()
              }}
              className="text-xs font-semibold text-[#C9A227] hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          <div className="ml-auto text-xs text-[#64748B] font-medium">
            Showing <strong className="text-[#0B1F3A]">{logs.length}</strong> events
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="hotel-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
            Reading audit telemetry...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
              No Audit Events Recorded
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              No matching activity logged for the selected filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9F9F7] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Room / Target</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {logs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-[#F9F9F7]/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                      {log.occurredAt
                        ? new Date(log.occurredAt).toLocaleString()
                        : log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : 'Recent'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getActorBadge(log.actorType)}
                        <span className="font-semibold text-[#0B1F3A]">
                          {renderActorName(log)}
                        </span>
                      </div>
                    </td>

                    {/* Room / Target */}
                    <td className="py-3.5 px-4">
                      {log.room?.number || log.roomNumber ? (
                        <span className="font-bold text-[#0B1F3A]">
                          Room {log.room?.number || log.roomNumber}
                        </span>
                      ) : log.entityType ? (
                        <span className="text-[#64748B] capitalize">
                          {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4">
                      {renderDetails(log)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F9F9F7] flex items-center justify-between text-xs">
          <span className="text-[#64748B]">
            Page <strong className="text-[#0B1F3A]">{page}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs py-1 px-2.5 h-8 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={logs.length < 50}
              className="btn-secondary text-xs py-1 px-2.5 h-8 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
