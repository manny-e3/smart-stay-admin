import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SlidersHorizontal,
  Download,
  Plus,
  Building2,
  LayoutGrid,
  Shield,
  AlertTriangle,
  ArrowRight,
  Thermometer,
  BatteryCharging,
  Wrench,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import roomsService from '../services/roomsService'
import alertsService from '../services/alertsService'
import requestsService from '../services/requestsService'

export default function DashboardContent({ onOpenQuickAction, onNavigateToRooms }) {
  const navigate = useNavigate()
  const { staff } = useAuth()

  const [boardData, setBoardData] = useState(null)
  const [openAlerts, setOpenAlerts] = useState([])
  const [openRequests, setOpenRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [quietHours, setQuietHours] = useState(true)
  const [lobbyLighting, setLobbyLighting] = useState(true)

  const handleGoToRooms = () => {
    if (onNavigateToRooms) onNavigateToRooms()
    navigate('/rooms')
  }

  // Load real telemetry and queues
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [boardRes, alertsRes, requestsRes] = await Promise.all([
        roomsService.getRoomBoard().catch(() => null),
        alertsService.listAlerts({ status: 'open' }).catch(() => null),
        requestsService.listRequests({ status: 'new,assigned,in_progress' }).catch(() => null),
      ])

      if (boardRes) setBoardData(boardRes)
      if (alertsRes) setOpenAlerts(alertsRes.items || [])
      if (requestsRes) setOpenRequests(requestsRes.items || [])
    } catch (e) {
      console.warn('Dashboard data fetch error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Resolve alert action
  const handleResolveAlert = async (alertId) => {
    try {
      await alertsService.resolveAlert(alertId, 'Resolved from Executive Dashboard')
      setOpenAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (e) {
      console.error(e)
    }
  }

  // Derived real counts
  const counts = boardData?.counts || {
    occupied: 0,
    vacant: 0,
    alert: 0,
    request: 0,
    dnd: 0,
    total: 26,
  }

  const totalSuites = counts.total || 26
  const occupiedSuites = counts.occupied || 0
  const occupancyPct = totalSuites > 0 ? ((occupiedSuites / totalSuites) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      {/* Header Title & Actions matching Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#B45309] tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>OPERATIONAL BRIEFING • LIVE SYSTEM</span>
          </div>
          <h1 className="font-headline font-bold text-3xl text-[#0B1F3A] tracking-tight">
            Welcome back, {staff?.name || 'Staff Member'}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            SmartStay Hotel Core • {occupiedSuites} of {totalSuites} suites currently occupied
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleGoToRooms}
            className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#64748B]" />
            <span>View Board</span>
          </button>

          {/* + Quick Action */}
          <button
            onClick={onOpenQuickAction}
            className="h-9 px-4 rounded-lg bg-[#C9A227] hover:bg-[#B58F1F] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Action</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Occupancy Rate */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                OCCUPANCY RATE
              </span>
              <div className="p-1 rounded bg-[#F4F4F2] text-[#64748B]">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                {occupancyPct}%
              </span>
              <span className="text-xs font-bold text-[#16A34A] flex items-center gap-0.5">
                Active
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">{occupiedSuites} / {totalSuites} Suites Occupied</p>
          </div>

          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div className="h-full bg-[#C9A227] rounded-full" style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Vacant Suites */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                VACANT INVENTORY
              </span>
              <div className="p-1 rounded bg-[#F4F4F2] text-[#64748B]">
                <LayoutGrid className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                {counts.vacant}
              </span>
              <span className="text-xs text-[#64748B] font-medium">Ready Suites</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#16A34A] mt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Inspected & Eco Ready</span>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] rounded-full"
                style={{ width: `${((counts.vacant / totalSuites) * 100).toFixed(0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Active Hardware Alerts */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                HARDWARE ALERTS
              </span>
              <div className="p-1 rounded bg-[#FEE2E2] text-[#DC2626]">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                {counts.alert}
              </span>
              <span className="text-xs font-bold text-red-600">Open Incidents</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Locks, ACs & Sensor Alerts</p>
          </div>

          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#DC2626] rounded-full"
                style={{ width: counts.alert > 0 ? '60%' : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Open Guest Requests */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                GUEST REQUEST QUEUE
              </span>
              <div className="p-1 rounded bg-[#FEF3C7] text-[#B45309]">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                {counts.request}
              </span>
              <span className="text-xs font-bold text-[#B45309]">Active Tasks</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Housekeeping & Concierge</p>
          </div>

          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D97706] rounded-full"
                style={{ width: counts.request > 0 ? '75%' : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Incidents & Guest Requests Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Hardware Incidents */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Active Hardware Incidents
              </h3>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs font-bold text-[#C9A227] hover:underline cursor-pointer"
            >
              View All ({openAlerts.length})
            </button>
          </div>

          {openAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              Zero open hardware faults across hotel inventory.
            </div>
          ) : (
            <div className="space-y-3">
              {openAlerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-xl border border-l-4 border-l-red-600 border-gray-200 bg-white flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0B1F3A]">
                        {alt.room?.number ? `Room ${alt.room.number}` : 'Public Area'}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                        {alt.severity}
                      </span>
                    </div>
                    <div className="text-xs text-[#0B1F3A] font-semibold mt-0.5">
                      {alt.title}
                    </div>
                    {alt.message && (
                      <div className="text-[11px] text-[#64748B]">"{alt.message}"</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleResolveAlert(alt.id)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-xs font-bold text-gray-700 transition-colors cursor-pointer shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Guest Requests Queue */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" />
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Guest Service Queue
              </h3>
            </div>
            <span className="text-xs text-[#64748B] font-medium">
              {openRequests.length} Active Tasks
            </span>
          </div>

          {openRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No pending service requests in queue.
            </div>
          ) : (
            <div className="space-y-3">
              {openRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0B1F3A]">
                        Room {req.room?.number || '101'}
                      </span>
                      <span className="capitalize font-semibold text-[#64748B]">
                        • {req.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#0B1F3A] mt-0.5">
                      {req.description}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Guest: {req.guest?.name || 'Registered Resident'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
