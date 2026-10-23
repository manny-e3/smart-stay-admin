import React, { useState, useEffect } from 'react'
import {
  QrCode,
  Users,
  Compass,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Key,
  KeyRound,
  LogOut,
  ArrowRightLeft,
  CalendarPlus,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Building,
  Check,
  Ban,
  Eye,
  Plus,
} from 'lucide-react'
import frontDeskService from '../services/frontDeskService'
import staysService from '../services/staysService'
import roomsService from '../services/roomsService'
import GuestDossierModal from './GuestDossierModal'
import ReservationModal from './ReservationModal'
import { MoveRoomModal, ExtendStayModal, AccessCodeModal, EditReservationModal, AdminQrScannerModal } from './StayActionModals'

export default function FrontDeskView() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [manifest, setManifest] = useState(null)
  const [stays, setStays] = useState([])
  const [rooms, setRooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'checked_in', 'reserved', 'checked_out'
  const [toastMessage, setToastMessage] = useState(null)

  // Modals state
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [activeDossierGuest, setActiveDossierGuest] = useState(null)
  const [activeMoveStay, setActiveMoveStay] = useState(null)
  const [activeExtendStay, setActiveExtendStay] = useState(null)
  const [activeEditStay, setActiveEditStay] = useState(null)
  const [activeAccessCodeData, setActiveAccessCodeData] = useState(null)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)

  // Availability Checker State
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false)
  const [availFrom, setAvailFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [availTo, setAvailTo] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0])
  const [availResults, setAvailResults] = useState(null)
  const [checkingAvail, setCheckingAvail] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const [todayData, staysData, boardData] = await Promise.all([
        frontDeskService.getTodayManifest().catch(() => null),
        staysService.searchStays({ limit: 50 }).catch(() => ({ items: [] })),
        roomsService.getRoomBoard().catch(() => ({ floors: [] })),
      ])

      if (todayData) setManifest(todayData)
      if (staysData?.items) setStays(staysData.items)

      const flatRooms = []
      if (boardData?.floors) {
        boardData.floors.forEach((f) => {
          if (f.rooms) f.rooms.forEach((r) => flatRooms.push(r))
        })
      }
      setRooms(flatRooms)
    } catch (err) {
      console.warn('FrontDesk data load error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Check In Handler
  const handleCheckIn = async (stay) => {
    try {
      await staysService.checkIn(stay.id)
      showToast(`Guest checked in successfully: Room ${stay.room?.number || ''}`)
      loadData(true)
    } catch (err) {
      showToast(`Check-in failed: ${err.message}`)
    }
  }

  // Check Out Handler
  const handleCheckOut = async (stay) => {
    if (!window.confirm(`Confirm check-out for Room ${stay.room?.number || ''} (${stay.guest?.firstName} ${stay.guest?.lastName})?`)) {
      return
    }
    try {
      await staysService.checkOut(stay.id)
      showToast(`Check-out recorded: Room ${stay.room?.number || ''}`)
      loadData(true)
    } catch (err) {
      showToast(`Check-out failed: ${err.message}`)
    }
  }

  // Cancel Reservation
  const handleCancelStay = async (stay) => {
    if (!window.confirm(`Cancel reservation for ${stay.guest?.firstName} ${stay.guest?.lastName}?`)) {
      return
    }
    try {
      await staysService.cancelStay(stay.id, { reason: 'Guest cancelled via front desk' })
      showToast('Reservation cancelled')
      loadData(true)
    } catch (err) {
      showToast(`Cancellation failed: ${err.message}`)
    }
  }

  // Mark No-Show
  const handleNoShow = async (stay) => {
    if (!window.confirm(`Mark reservation #${stay.id} as no-show?`)) {
      return
    }
    try {
      await staysService.markNoShow(stay.id, { reason: 'No arrival recorded' })
      showToast('Marked as no-show')
      loadData(true)
    } catch (err) {
      showToast(`Action failed: ${err.message}`)
    }
  }

  // Generate Access Code
  const handleGenerateCode = async (stay) => {
    try {
      const codeRes = await staysService.generateAccessCode(stay.id)
      setActiveAccessCodeData({ ...codeRes, stay })
    } catch (err) {
      showToast(`Access code error: ${err.message}`)
    }
  }

  // Issue Digital Keys
  const handleIssueKeys = async (stay) => {
    try {
      await staysService.issueKeys(stay.id)
      showToast(`Digital keys re-issued for Room ${stay.room?.number || ''}`)
      loadData(true)
    } catch (err) {
      showToast(`Key issuance failed: ${err.message}`)
    }
  }

  // Check Availability
  const handleCheckAvailability = async (e) => {
    e?.preventDefault()
    try {
      setCheckingAvail(true)
      const data = await frontDeskService.checkRoomAvailability({
        from: new Date(`${availFrom}T14:00:00.000Z`).toISOString(),
        to: new Date(`${availTo}T11:00:00.000Z`).toISOString(),
      })
      setAvailResults(data)
    } catch (err) {
      showToast(`Availability query failed: ${err.message}`)
    } finally {
      setCheckingAvail(false)
    }
  }

  // Filter Stays
  const filteredStays = stays.filter((s) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'checked_in'
        ? s.status === 'checked_in'
        : statusFilter === 'reserved'
        ? s.status === 'reserved'
        : statusFilter === 'checked_out'
        ? s.status === 'checked_out'
        : true

    const guestName = `${s.guest?.firstName || ''} ${s.guest?.lastName || ''}`.toLowerCase()
    const roomStr = String(s.room?.number || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      !searchQuery ||
      guestName.includes(query) ||
      roomStr.includes(query) ||
      String(s.id).includes(query)

    return matchesStatus && matchesSearch
  })

  const counts = manifest?.counts || {
    arrivals: 0,
    departures: 0,
    inHouse: stays.filter((s) => s.status === 'checked_in').length,
    overdueCheckOuts: 0,
    vacantRooms: rooms.filter((r) => !r.occupied).length,
    totalRooms: rooms.length,
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            EXECUTIVE OPERATIONS CONSOLE
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Front Desk & Daily Stays Manifest
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time reservations, arrivals/departures, room transfers, and digital key management
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="h-9 px-3.5 rounded-xl border border-[#C9A227] bg-[#C9A227]/10 hover:bg-[#C9A227]/20 text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Scan physical or mobile guest QR pass"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Scan Guest QR</span>
          </button>

          <button
            onClick={() => setShowAvailabilityChecker(!showAvailabilityChecker)}
            className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{showAvailabilityChecker ? 'Hide Availability' : 'Check Availability'}</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh manifest"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsReservationModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Today's Operational Manifest Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* In-House Guests */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between text-[#15803D] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">In-House Guests</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-headline font-bold text-[#0B1F3A]">{counts.inHouse}</div>
          <span className="text-[11px] text-[#15803D] font-medium">Currently in suites</span>
        </div>

        {/* Today's Arrivals */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between text-[#2563EB] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Arrivals Today</span>
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="text-2xl font-headline font-bold text-[#0B1F3A]">{counts.arrivals}</div>
          <span className="text-[11px] text-[#64748B]">Expected check-ins</span>
        </div>

        {/* Today's Departures */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between text-[#D97706] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Departures</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-headline font-bold text-[#0B1F3A]">{counts.departures}</div>
          <span className="text-[11px] text-[#64748B]">Scheduled check-outs</span>
        </div>

        {/* Overdue Check-outs */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between text-[#DC2626] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Overdue Out</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-headline font-bold text-[#DC2626]">{counts.overdueCheckOuts}</div>
          <span className="text-[11px] text-[#DC2626] font-medium">Key expiry pending</span>
        </div>

        {/* Vacant Suites */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <div className="flex items-center justify-between text-[#C9A227] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Vacant Suites</span>
            <Building className="w-4 h-4" />
          </div>
          <div className="text-2xl font-headline font-bold text-[#0B1F3A]">{counts.vacantRooms}</div>
          <span className="text-[11px] text-[#64748B]">of {counts.totalRooms || rooms.length} inventory</span>
        </div>
      </div>

      {/* Date-Range Room Availability Checker Drawer */}
      {showAvailabilityChecker && (
        <div className="bg-white rounded-2xl p-5 border border-[#C9A227]/40 shadow-md animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                  Live Room Availability Engine (GET /admin/rooms/availability)
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Query free suites and capacity across specific check-in and check-out windows
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAvailabilityChecker(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleCheckAvailability} className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">From Date</label>
              <input
                type="date"
                required
                value={availFrom}
                onChange={(e) => setAvailFrom(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">To Date</label>
              <input
                type="date"
                required
                value={availTo}
                onChange={(e) => setAvailTo(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
              />
            </div>
            <button
              type="submit"
              disabled={checkingAvail}
              className="h-8 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {checkingAvail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-[#C9A227]" />}
              <span>Query Free Rooms</span>
            </button>
          </form>

          {availResults && (
            <div className="bg-[#F9F9F7] p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1F3A]">
                  Total Free Suites: <span className="text-[#15803D]">{availResults.total} Available</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availResults.byRoomType && Object.entries(availResults.byRoomType).map(([type, cnt]) => (
                  <span
                    key={type}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5"
                  >
                    <span>{type}:</span>
                    <span className="font-bold text-[#C9A227]">{cnt} free</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Stays' },
            { id: 'checked_in', label: 'In-House' },
            { id: 'reserved', label: 'Upcoming / Reserved' },
            { id: 'checked_out', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#0B1F3A] text-white shadow-2xs'
                  : 'bg-[#F9F9F7] text-[#64748B] hover:text-[#0B1F3A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guest name, room, or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      {/* Stays Manifest Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#64748B]">Loading hotel guest manifest...</p>
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#0B1F3A]">No stays matching the selected criteria</p>
            <p className="text-xs text-[#64748B] mt-1">Try resetting the status filter or searching for another name</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F9F7] border-b border-[#E5E7EB] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Stay Ref</th>
                  <th className="py-3.5 px-4">Guest Dossier</th>
                  <th className="py-3.5 px-4">Allocated Suite</th>
                  <th className="py-3.5 px-4">Arrival / Departure</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions & Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredStays.map((st) => {
                  const guestName = `${st.guest?.firstName || ''} ${st.guest?.lastName || ''}`.trim() || 'Valued Guest'
                  const isCheckedIn = st.status === 'checked_in'
                  const isReserved = st.status === 'reserved'
                  const isVip = Boolean(st.guest?.vip)

                  return (
                    <tr key={st.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Stay Ref */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0B1F3A]">
                        #{st.id}
                      </td>

                      {/* Guest Dossier */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveDossierGuest(st.guest)}
                            className="font-bold text-[#0B1F3A] hover:text-[#C9A227] flex items-center gap-1.5 cursor-pointer text-left"
                            title="Inspect full guest dossier & history"
                          >
                            <span>{guestName}</span>
                            {isVip && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C9A227]/20 text-[#B45309] border border-[#C9A227]/40 uppercase">
                                VIP
                              </span>
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          {st.guest?.email || st.guest?.phone || 'No direct phone'}
                        </span>
                      </td>

                      {/* Suite */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0B1F3A] block">
                          {st.room?.number ? `Room ${st.room.number}` : 'Unassigned'}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Floor {st.room?.floor || 1} • {st.adults || 1} Adult{st.adults > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-[#0B1F3A] font-medium">
                          <span>{new Date(st.arrival).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          <span className="text-gray-400">→</span>
                          <span>{new Date(st.departure).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <span className="text-[10px] text-[#64748B]">
                          {Math.max(1, Math.round((new Date(st.departure) - new Date(st.arrival)) / (1000 * 60 * 60 * 24)))} Nights
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                            isCheckedIn
                              ? 'bg-emerald-100 text-emerald-800'
                              : isReserved
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-600' : isReserved ? 'bg-blue-600' : 'bg-gray-400'}`} />
                          <span>{st.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Check-in button if reserved */}
                          {isReserved && (
                            <button
                              onClick={() => handleCheckIn(st)}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              title="Check in guest now"
                            >
                              Check In
                            </button>
                          )}

                          {/* Check-out button if in-house */}
                          {isCheckedIn && (
                            <button
                              onClick={() => handleCheckOut(st)}
                              className="h-7 px-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white font-bold text-[11px] transition-colors cursor-pointer"
                              title="Execute check-out"
                            >
                              Check Out
                            </button>
                          )}

                          {/* Move Room button if active */}
                          {(isCheckedIn || isReserved) && (
                            <button
                              onClick={() => setActiveMoveStay(st)}
                              className="h-7 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Reassign or move suite"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-[#C9A227] inline mr-1" />
                              <span>Move</span>
                            </button>
                          )}

                          {/* Extend Stay */}
                          {(isCheckedIn || isReserved) && (
                            <button
                              onClick={() => setActiveExtendStay(st)}
                              className="h-7 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Change departure date"
                            >
                              <CalendarPlus className="w-3 h-3 text-blue-600 inline mr-1" />
                              <span>Extend</span>
                            </button>
                          )}

                          {/* Generate Access Code */}
                          <button
                            onClick={() => handleGenerateCode(st)}
                            className="h-7 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Generate guest mobile app access code"
                          >
                            <KeyRound className="w-3 h-3 text-[#C9A227] inline mr-1" />
                            <span>Code</span>
                          </button>

                          {/* Issue Digital Keys */}
                          {isCheckedIn && (
                            <button
                              onClick={() => handleIssueKeys(st)}
                              className="h-7 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Re-issue mobile Bluetooth/digital keys"
                            >
                              <Key className="w-3 h-3 text-emerald-600 inline mr-1" />
                              <span>Keys</span>
                            </button>
                          )}

                          {/* Edit if reserved */}
                          {isReserved && (
                            <button
                              onClick={() => setActiveEditStay(st)}
                              className="h-7 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#0B1F3A] text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Edit reservation parameters"
                            >
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Cancel if reserved */}
                          {isReserved && (
                            <button
                              onClick={() => handleCancelStay(st)}
                              className="h-7 px-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Cancel reservation"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservation Creation Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onConfirm={(stay) => {
          const guestName = stay?.guest ? `${stay.guest.firstName} ${stay.guest.lastName}` : 'Guest'
          const guestEmail = stay?.guest?.email
          if (guestEmail) {
            showToast(`Reservation confirmed for ${guestName}. Mobile login details emailed to ${guestEmail}`)
          } else {
            showToast(`Reservation confirmed and allocated for ${guestName}`)
          }
          loadData(true)
        }}
      />

      {/* Guest Dossier Modal */}
      <GuestDossierModal
        guest={activeDossierGuest}
        guestId={activeDossierGuest?.id}
        onClose={() => setActiveDossierGuest(null)}
        onGuestUpdated={() => loadData(true)}
      />

      {/* Move Room Modal */}
      <MoveRoomModal
        isOpen={Boolean(activeMoveStay)}
        onClose={() => setActiveMoveStay(null)}
        stay={activeMoveStay}
        rooms={rooms}
        onSuccess={() => {
          showToast('Room move executed successfully')
          loadData(true)
        }}
      />

      {/* Extend Stay Modal */}
      <ExtendStayModal
        isOpen={Boolean(activeExtendStay)}
        onClose={() => setActiveExtendStay(null)}
        stay={activeExtendStay}
        onSuccess={() => {
          showToast('Departure updated successfully')
          loadData(true)
        }}
      />

      {/* Edit Reservation Modal */}
      <EditReservationModal
        isOpen={Boolean(activeEditStay)}
        onClose={() => setActiveEditStay(null)}
        stay={activeEditStay}
        rooms={rooms}
        onSuccess={() => {
          showToast('Reservation parameters updated successfully')
          loadData(true)
        }}
      />

      {/* Access Code Display Modal */}
      <AccessCodeModal
        isOpen={Boolean(activeAccessCodeData)}
        onClose={() => setActiveAccessCodeData(null)}
        codeData={activeAccessCodeData}
        stay={activeAccessCodeData?.stay}
      />

      {/* Front Desk QR Guest Scanner Modal */}
      <AdminQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onCheckInSuccess={(checkedInStay) => {
          showToast(`Guest ${checkedInStay?.reference || ''} checked in via QR`);
          loadData(true);
        }}
      />
    </div>
  )
}
