import React, { useState } from 'react'
import {
  BedDouble,
  Building,
  CheckCircle2,
  Clock,
  Wrench,
  Filter,
  Sparkles,
  Plus,
  Compass,
} from 'lucide-react'
import RoomMatrixCard from './RoomMatrixCard'

export default function RoomMatrixView({
  rooms,
  onOpenReservationModal,
  onSelectRoom,
}) {
  const [selectedWing, setSelectedWing] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredRooms = rooms.filter((r) => {
    const matchesWing =
      selectedWing === 'all'
        ? true
        : r.wing.toLowerCase().includes(selectedWing.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' ? true : r.status === selectedStatus
    return matchesWing && matchesStatus
  })

  // Counts
  const checkedInCount = rooms.filter((r) => r.status === 'checked-in').length
  const pendingCount = rooms.filter((r) => r.status === 'pending').length
  const alertCount = rooms.filter((r) => r.status === 'alert').length

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            SPATIAL INVENTORY & MATRIX
          </span>
          <h1 className="headline-xl">
            Room Matrix & Suite Inventory
          </h1>
          <p className="body-md text-[#64748B] mt-1">
            Visual architectural grid of suites, discrete occupancy states, and housekeeping telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReservationModal}
            className="btn-primary"
            id="btn-assign-suite-matrix"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Suite</span>
          </button>
        </div>
      </div>

      {/* Status Summary Indicator Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'checked-in' ? 'all' : 'checked-in')}
          className={`hotel-card p-4 flex items-center justify-between cursor-pointer border-l-[3px] border-l-[#16A34A] transition-all ${
            selectedStatus === 'checked-in' ? 'ring-2 ring-[#16A34A]/30 bg-[#F9F9F7]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
            <div>
              <span className="label-sm text-[#0B1F3A]">Operational & In-House</span>
              <p className="text-[11px] text-[#64748B]">Suites occupied or inspected clear</p>
            </div>
          </div>
          <span className="headline-md text-[#15803D]">{checkedInCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
          className={`hotel-card p-4 flex items-center justify-between cursor-pointer border-l-[3px] border-l-[#F59E0B] transition-all ${
            selectedStatus === 'pending' ? 'ring-2 ring-[#F59E0B]/30 bg-[#F9F9F7]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <div>
              <span className="label-sm text-[#0B1F3A]">Turnover & Audit Pending</span>
              <p className="text-[11px] text-[#64748B]">Housekeeping active or awaiting check-in</p>
            </div>
          </div>
          <span className="headline-md text-[#B45309]">{pendingCount}</span>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'alert' ? 'all' : 'alert')}
          className={`hotel-card p-4 flex items-center justify-between cursor-pointer border-l-[3px] border-l-[#DC2626] transition-all ${
            selectedStatus === 'alert' ? 'ring-2 ring-[#DC2626]/30 bg-[#F9F9F7]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
            <div>
              <span className="label-sm text-[#0B1F3A]">Maintenance Calibration Alert</span>
              <p className="text-[11px] text-[#64748B]">Engineering work order dispatched</p>
            </div>
          </div>
          <span className="headline-md text-[#B91C1C]">{alertCount}</span>
        </div>
      </div>

      {/* Wing / Floor Filtering Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#7587A7] uppercase tracking-wider mr-2">
            Property Wings:
          </span>
          <button
            onClick={() => setSelectedWing('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedWing === 'all'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            All Wings ({rooms.length})
          </button>
          <button
            onClick={() => setSelectedWing('north')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedWing === 'north'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            North Wing (Ocean Panorama)
          </button>
          <button
            onClick={() => setSelectedWing('south')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedWing === 'south'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            South Wing (Botanical Gardens)
          </button>
          <button
            onClick={() => setSelectedWing('ground')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedWing === 'ground'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Ground Level (Beach Terraces)
          </button>
        </div>

        <div className="text-xs text-[#64748B] font-medium">
          Showing <span className="font-bold text-[#0B1F3A]">{filteredRooms.length}</span> suites
        </div>
      </div>

      {/* Room Matrix Grid (Specification: 12px rounded cards, 3px left border, delicate line icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomMatrixCard
            key={room.id}
            room={room}
            onSelectRoom={onSelectRoom}
          />
        ))}
      </div>
    </div>
  )
}
