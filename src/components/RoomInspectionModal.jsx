import React from 'react'
import {
  X,
  Crown,
  Gem,
  Shield,
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  KeyRound,
  Calendar,
  Layers,
} from 'lucide-react'

export default function RoomInspectionModal({ room, onClose, onUpdateStatus }) {
  if (!room) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#000615]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-[0_20px_40px_-8px_rgba(11,31,58,0.12),0_8px_16px_-4px_rgba(11,31,58,0.04)] transition-all sm:my-8 sm:w-full sm:max-w-xl border border-[#E5E7EB]">
          {/* Header */}
          <div className="bg-[#0B1F3A] px-6 py-5 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-lg text-white">
                  {room.number} — Inspection Overview
                </h3>
              </div>
              <p className="text-xs text-[#B5C7EA] mt-0.5">
                {room.tier} • {room.wing}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Status Pills */}
            <div className="flex items-center justify-between bg-[#F9F9F7] p-4 rounded-xl border border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Telemetry Status
                </span>
                <span
                  className={`status-chip mt-1.5 ${
                    room.status === 'checked-in'
                      ? 'status-checked-in'
                      : room.status === 'pending'
                      ? 'status-pending'
                      : 'status-alert'
                  }`}
                >
                  <span className="status-chip-dot" />
                  {room.status === 'checked-in'
                    ? 'Operational'
                    : room.status === 'pending'
                    ? 'Turnover Pending'
                    : 'Maintenance Alert'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Nightly Tariff
                </span>
                <span className="text-sm font-bold text-[#0B1F3A] mt-1 block">
                  {room.nightlyRate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Occupancy State
                </span>
                <span className="text-xs font-semibold text-[#0B1F3A] mt-1.5 block">
                  {room.occupancy}
                </span>
              </div>
            </div>

            {/* Resident details if occupied */}
            {room.guest && (
              <div className="bg-[#FEF7DB]/50 border border-[#C9A227]/30 rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#755B00] uppercase tracking-wider block mb-1">
                  Current In-House Resident
                </span>
                <p className="text-sm font-bold text-[#0B1F3A]">{room.guest}</p>
                <p className="text-xs text-[#755B00] mt-0.5">{room.vipTier}</p>
              </div>
            )}

            {/* Suite Amenities */}
            <div>
              <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                Suite Architecture & Private Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#E5E7EB] text-xs font-medium text-[#0B1F3A]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Housekeeping state toggle */}
            <div>
              <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                Fast Housekeeping Override
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateStatus(room.id, 'checked-in')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                    room.status === 'checked-in'
                      ? 'border-[#16A34A] bg-[#DCFCE7] text-[#15803D]'
                      : 'border-[#E5E7EB] hover:bg-[#F9F9F7] text-[#64748B]'
                  }`}
                >
                  Clear Inspected
                </button>
                <button
                  onClick={() => onUpdateStatus(room.id, 'pending')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                    room.status === 'pending'
                      ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#B45309]'
                      : 'border-[#E5E7EB] hover:bg-[#F9F9F7] text-[#64748B]'
                  }`}
                >
                  Mark Turnover
                </button>
                <button
                  onClick={() => onUpdateStatus(room.id, 'alert')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                    room.status === 'alert'
                      ? 'border-[#DC2626] bg-[#FEE2E2] text-[#B91C1C]'
                      : 'border-[#E5E7EB] hover:bg-[#F9F9F7] text-[#64748B]'
                  }`}
                >
                  Log Work Order
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#F9F9F7] px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn-secondary text-xs">
              Close
            </button>
            <button onClick={onClose} className="btn-primary text-xs">
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
