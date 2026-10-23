import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  Sparkles,
  BedDouble,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  BellRing,
  Moon,
  Layers,
  Plus,
  Check,
} from 'lucide-react'
import IoTRoomCard from './IoTRoomCard'
import RoomModal from './RoomModal'
import DeleteRoomModal from './DeleteRoomModal'
import roomsService from '../services/roomsService'
import { onSocketEvent } from '../services/socket'

export default function RoomsGridScreen({
  rooms = [],
  onOpenRoomDetail,
  onToggleDevice,
  onRefreshRooms,
}) {
  const navigate = useNavigate()
  const [boardData, setBoardData] = useState(null)
  const [liveRooms, setLiveRooms] = useState(rooms)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'alert' | 'request' | 'dnd' | 'occupied' | 'vacant'
  const [floorFilter, setFloorFilter] = useState('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')

  // Modals & Toast State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [roomToEdit, setRoomToEdit] = useState(null)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Sync props
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setLiveRooms(rooms)
    }
  }, [rooms])

  // Fetch real rooms board from backend
  const fetchBoard = async () => {
    try {
      setLoading(true)
      const data = await roomsService.getRoomBoard()
      if (data) {
        setBoardData(data)
        // Flatten all floors rooms if present
        if (data.floors && Array.isArray(data.floors)) {
          const flat = []
          data.floors.forEach((f) => {
            if (f.rooms) {
              f.rooms.forEach((r) => flat.push({ ...r, floorNumber: f.number, floorName: f.name }))
            }
          })
          if (flat.length > 0) {
            setLiveRooms(flat)
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend room board (using current state):', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoard()
  }, [])

  // Listen to live Socket.IO events
  useEffect(() => {
    // Single room updated on the fly
    const unsubRoom = onSocketEvent('board:room', (roomSummary) => {
      setLiveRooms((prev) =>
        prev.map((r) => (r.id === roomSummary.id ? { ...r, ...roomSummary } : r))
      )
    })

    // Whole board refreshed
    const unsubRefresh = onSocketEvent('board:refresh', () => {
      fetchBoard()
    })

    return () => {
      unsubRoom()
      unsubRefresh()
    }
  }, [])

  const handleOpenDetail = (room) => {
    if (onOpenRoomDetail) {
      onOpenRoomDetail(room)
    }
    navigate(`/rooms/${room.id || room.number}`)
  }

  const handleCreateRoom = async (payload) => {
    const created = await roomsService.createRoom(payload)
    triggerToast(`Suite ${created.number || payload.number} registered successfully`)
    await fetchBoard()
    if (onRefreshRooms) onRefreshRooms()
  }

  const handleUpdateRoom = async (payload) => {
    if (!roomToEdit) return
    const updated = await roomsService.updateRoom(roomToEdit.id, payload)
    triggerToast(`Suite ${updated?.number || roomToEdit.number} updated successfully`)
    await fetchBoard()
    if (onRefreshRooms) onRefreshRooms()
  }

  const handleDeleteRoom = async (roomId) => {
    await roomsService.deleteRoom(roomId)
    triggerToast('Suite removed from hotel inventory')
    await fetchBoard()
    if (onRefreshRooms) onRefreshRooms()
  }

  // Filter logic
  const filteredRooms = liveRooms.filter((r) => {
    const numStr = String(r.number || '').toLowerCase()
    const guestStr = String(r.guest?.name || r.guest || '').toLowerCase()
    const typeStr = String(r.roomType?.name || r.tier || '').toLowerCase()
    const q = searchQuery.toLowerCase()

    const matchesSearch = numStr.includes(q) || guestStr.includes(q) || typeStr.includes(q)

    // Status filter
    let matchesStatus = true
    const st = (r.status || '').toLowerCase()
    if (statusFilter !== 'all') {
      if (statusFilter === 'alert') matchesStatus = st === 'alert' || (r.openAlerts > 0)
      else if (statusFilter === 'request') matchesStatus = st === 'request' || (r.openRequests > 0)
      else if (statusFilter === 'dnd') matchesStatus = st === 'dnd' || r.dnd
      else if (statusFilter === 'occupied') matchesStatus = st === 'occupied' || (r.occupied && st !== 'alert' && st !== 'request' && st !== 'dnd')
      else if (statusFilter === 'vacant') matchesStatus = st === 'vacant' || st === 'available' || !r.occupied
    }

    // Floor filter
    let matchesFloor = true
    if (floorFilter !== 'all') {
      const roomFloorNum = r.floor?.number !== undefined ? String(r.floor.number) : String(r.floorNumber || '')
      matchesFloor = roomFloorNum === String(floorFilter)
    }

    // Room type filter
    let matchesType = true
    if (roomTypeFilter !== 'all') {
      matchesType = typeStr.toLowerCase() === roomTypeFilter.toLowerCase()
    }

    return matchesSearch && matchesStatus && matchesFloor && matchesType
  })

  // Dynamic counts from backend or derived
  const counts = boardData?.counts || {
    alert: liveRooms.filter((r) => (r.status || '').toLowerCase() === 'alert' || r.openAlerts > 0).length,
    request: liveRooms.filter((r) => (r.status || '').toLowerCase() === 'request' || r.openRequests > 0).length,
    dnd: liveRooms.filter((r) => (r.status || '').toLowerCase() === 'dnd' || r.dnd).length,
    occupied: liveRooms.filter((r) => (r.status || '').toLowerCase() === 'occupied' || r.occupied).length,
    vacant: liveRooms.filter((r) => (r.status || '').toLowerCase() === 'vacant' || (r.status || '').toLowerCase() === 'available' || !r.occupied).length,
    total: liveRooms.length,
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header matching Theme */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            HOTEL INVENTORY & IOT TELEMETRY (RELEASE 1 & 2)
          </span>
          <div className="flex items-center gap-3">
            <h1 className="headline-xl">
              Rooms & Suites Board
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#0B1F3A]">
              {liveRooms.length} Units Online
            </span>
            <button
              onClick={fetchBoard}
              title="Refresh live board"
              disabled={loading}
              className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#0B1F3A] hover:bg-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="body-md text-[#64748B] mt-1">
            Live telemetry stream from connected door locks, AC thermostats, presence sensors, and power meters.
          </p>
        </div>

        {/* Search Bar, Filters & Add Suite Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add Suite Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#16335C] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>Add Suite</span>
          </button>

          {/* Search Bar */}
          <div className="relative w-56 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suite number, guest, type..."
              className="hotel-input pl-10 pr-4 text-xs"
            />
          </div>

          {/* Floor Dropdown */}
          <div className="relative">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="hotel-input pr-9 text-xs font-semibold appearance-none cursor-pointer"
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]" />
          </div>

          {/* Room Type Dropdown */}
          <div className="relative">
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="hotel-input pr-9 text-xs font-semibold appearance-none cursor-pointer"
            >
              <option value="all">All Room Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="executive">Executive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]" />
          </div>
        </div>
      </div>

      {/* Real-time Status Filter Pills matching Postman collection parameters: status=alert,request,dnd,occupied,vacant */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* All */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]'
            }`}
          >
            All Units ({counts.total || liveRooms.length})
          </button>

          {/* Alert */}
          <button
            onClick={() => setStatusFilter('alert')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'alert'
                ? 'bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#DC2626]/20'
                : 'text-[#64748B] hover:text-[#DC2626] hover:bg-red-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            Alerts ({counts.alert || 0})
          </button>

          {/* Request */}
          <button
            onClick={() => setStatusFilter('request')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'request'
                ? 'bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#D97706]/20'
                : 'text-[#64748B] hover:text-[#B45309] hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            Requests ({counts.request || 0})
          </button>

          {/* DND */}
          <button
            onClick={() => setStatusFilter('dnd')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'dnd'
                ? 'bg-[#F3E8FF] text-[#7E22CE] ring-1 ring-[#7E22CE]/20'
                : 'text-[#64748B] hover:text-[#7E22CE] hover:bg-purple-50'
            }`}
          >
            <Moon className="w-3 h-3 text-[#7E22CE]" />
            DND ({counts.dnd || 0})
          </button>

          {/* Occupied */}
          <button
            onClick={() => setStatusFilter('occupied')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'occupied'
                ? 'bg-[#DCFCE7] text-[#15803D] ring-1 ring-[#16A34A]/20'
                : 'text-[#64748B] hover:text-[#15803D] hover:bg-green-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Occupied ({counts.occupied || 0})
          </button>

          {/* Vacant */}
          <button
            onClick={() => setStatusFilter('vacant')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'vacant'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] ring-1 ring-[#3B82F6]/20'
                : 'text-[#64748B] hover:text-[#1D4ED8] hover:bg-blue-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            Vacant ({counts.vacant || 0})
          </button>
        </div>

        <div className="text-xs text-[#64748B] font-medium hidden sm:block">
          Showing <span className="font-bold text-[#0B1F3A]">{filteredRooms.length}</span> suites matching filters
        </div>
      </div>

      {/* Room Cards Grid (Strictly 3 per row on desktop for optimal proportions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <IoTRoomCard
            key={room.id}
            room={room}
            onOpenDetail={handleOpenDetail}
            onToggleDevice={onToggleDevice}
            onEditRoom={(r) => setRoomToEdit(r)}
            onDeleteRoom={(r) => setRoomToDelete(r)}
          />
        ))}
      </div>

      {/* Add Room Modal */}
      <RoomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateRoom}
      />

      {/* Edit Room Modal */}
      <RoomModal
        isOpen={Boolean(roomToEdit)}
        onClose={() => setRoomToEdit(null)}
        onSubmit={handleUpdateRoom}
        room={roomToEdit}
      />

      {/* Delete Room Confirmation Modal */}
      <DeleteRoomModal
        isOpen={Boolean(roomToDelete)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteRoom}
        room={roomToDelete}
      />
    </div>
  )
}
