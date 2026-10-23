import React from 'react'
import {
  Users,
  User,
  Sparkles,
  Clock,
  Wrench,
  CheckCircle2,
  Crown,
  Gem,
  Key,
  Shield,
  Eye,
  Sliders,
} from 'lucide-react'

export default function RoomMatrixCard({ room, onSelectRoom }) {
  // Border color based solely on status (3px left border specification)
  const getBorderColorClass = () => {
    switch (room.status) {
      case 'checked-in':
        return 'border-l-[3px] border-l-[#16A34A]'
      case 'pending':
        return 'border-l-[3px] border-l-[#F59E0B]'
      case 'alert':
        return 'border-l-[3px] border-l-[#DC2626]'
      default:
        return 'border-l-[3px] border-l-[#CBD5E1]'
    }
  }

  // Delicate line icon for suite tier
  const getTierIcon = () => {
    if (room.tier.includes('Presidential') || room.tier.includes('Royal')) {
      return <Crown className="w-4 h-4 text-[#C9A227]" />
    }
    if (room.tier.includes('Sanctuary') || room.tier.includes('Penthouse')) {
      return <Gem className="w-4 h-4 text-[#755B00]" />
    }
    return <Shield className="w-4 h-4 text-[#7587A7]" />
  }

  // Delicate line icon for housekeeping
  const getHousekeepingIcon = () => {
    if (room.status === 'checked-in') {
      return <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
    }
    if (room.status === 'pending') {
      return <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
    }
    return <Wrench className="w-3.5 h-3.5 text-[#DC2626]" />
  }

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`bg-white rounded-xl border border-[#E5E7EB]/70 ${getBorderColorClass()} p-5 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04),0_1px_4px_-1px_rgba(11,31,58,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(11,31,58,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between`}
    >
      <div>
        {/* Header: Suite number, Tier Icon, and Nightly Rate */}
        <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F7F7F5] border border-[#E5E7EB]">
              {getTierIcon()}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#0B1F3A] tracking-tight">
                {room.number}
              </h3>
              <p className="text-[11px] font-semibold text-[#64748B] tracking-wide">
                Floor {room.floor} • {room.wing.split('—')[0].trim()}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#0B1F3A] bg-[#F7F7F5] px-2 py-1 rounded border border-[#E5E7EB]">
            {room.nightlyRate}<span className="text-[10px] text-[#64748B] font-normal">/nt</span>
          </span>
        </div>

        {/* Suite Tier Name */}
        <p className="text-xs font-semibold text-[#0B1F3A] mb-2 truncate">
          {room.tier}
        </p>

        {/* Occupant / Guest Status */}
        <div className="mb-4">
          {room.guest ? (
            <div className="bg-[#F9F9F7] rounded-lg p-2.5 border border-[#E5E7EB]/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0B1F3A] truncate">
                  {room.guest}
                </span>
                {room.vipTier && (
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] ring-2 ring-[#C9A227]/20" title="VIP Guest" />
                )}
              </div>
              <p className="text-[10px] text-[#64748B] mt-0.5">{room.vipTier || 'Registered Guest'}</p>
            </div>
          ) : (
            <div className="bg-[#F9F9F7] rounded-lg p-2.5 border border-dashed border-[#CBD5E1] text-center">
              <span className="text-[11px] text-[#64748B] font-medium italic">
                Vacant Suite — Available for Assignment
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Indicators: Occupancy count and Housekeeping State with line icons */}
      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
        {/* Occupancy Indicator */}
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Users className="w-3.5 h-3.5 text-[#7587A7]" />
          <span>{room.occupancy}</span>
        </div>

        {/* Housekeeping state indicator */}
        <div className="flex items-center gap-1.5 font-medium">
          {getHousekeepingIcon()}
          <span
            className={
              room.status === 'checked-in'
                ? 'text-[#15803D]'
                : room.status === 'pending'
                ? 'text-[#B45309]'
                : 'text-[#B91C1C]'
            }
          >
            {room.housekeeping.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  )
}
