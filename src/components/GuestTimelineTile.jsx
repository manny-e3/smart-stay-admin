import React from 'react'
import {
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  Plane,
  Wine,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

export default function GuestTimelineTile({ guest, onInspectDossier }) {
  if (!guest) return null

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04),0_1px_4px_-1px_rgba(11,31,58,0.02)] transition-all">
      {/* Top Banner: Guest Identity and VIP Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm">
            {guest.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                {guest.name}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#FEF3C7] text-[#B45309] border border-[#C9A227]/30">
                <Sparkles className="w-3 h-3 text-[#C9A227]" />
                {guest.vipLevel.split('(')[0].trim()}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {guest.party} • <span className="font-semibold text-[#0B1F3A]">{guest.room}</span> ({guest.tier})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onInspectDossier(guest)}
            className="btn-secondary text-xs h-9 px-3.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>VIP Dossier</span>
          </button>
        </div>
      </div>

      {/* Guest Minimal Horizontal Sequence Line */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          <span>Stay Sequence Milestones</span>
          <span className="text-[#0B1F3A] font-semibold">{guest.nights} Nights Total Stay</span>
        </div>

        {/* Minimal Horizontal Sequence Track */}
        <div className="relative mt-2">
          {/* Base Track Line */}
          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E5E7EB]" />
          
          {/* Active Progress Fill Line */}
          <div
            className="absolute top-3.5 left-4 h-0.5 bg-[#C9A227] transition-all duration-500"
            style={{ width: `${Math.min(guest.timeline.progressPercent || 35, 92)}%` }}
          />

          <div className="relative flex justify-between">
            {/* Milestone 1: Checked-In */}
            <div className="flex flex-col items-center text-center max-w-[130px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-colors ${
                  guest.status === 'checked-in'
                    ? 'border-[#16A34A] text-[#16A34A] ring-4 ring-[#DCFCE7]'
                    : 'border-[#F59E0B] text-[#F59E0B] ring-4 ring-[#FEF3C7]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-[#0B1F3A] mt-2 tracking-wide uppercase">
                Checked-In
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                {guest.timeline.checkedInTime}
              </span>
            </div>

            {/* Milestone 2: Stay Duration Progress */}
            <div className="flex flex-col items-center text-center max-w-[170px]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white z-10 ring-4 ring-slate-100">
                <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
              </div>
              <span className="text-[11px] font-bold text-[#0B1F3A] mt-2 tracking-wide uppercase">
                Stay In-Progress
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                {guest.timeline.stayDuration}
              </span>
            </div>

            {/* Milestone 3: Scheduled Departure */}
            <div className="flex flex-col items-center text-center max-w-[140px]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#CBD5E1] bg-white text-[#64748B] z-10 ring-4 ring-[#F7F7F5]">
                <Plane className="w-3.5 h-3.5 text-[#7587A7]" />
              </div>
              <span className="text-[11px] font-bold text-[#0B1F3A] mt-2 tracking-wide uppercase">
                Departure Milestone
              </span>
              <span className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                {guest.timeline.departureMilestone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Requests & Assigned Butler Footer */}
      <div className="mt-2 pt-4 border-t border-[#F1F5F9] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-[#F9F9F7] p-3 rounded-lg border border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Bespoke Protocol & Preferences
          </span>
          <p className="text-[11px] text-[#0B1F3A] italic">
            "{guest.specialRequests}"
          </p>
        </div>

        <div className="bg-[#F9F9F7] p-3 rounded-lg border border-[#E5E7EB] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
              Assigned Lead Butler
            </span>
            <p className="text-xs font-semibold text-[#0B1F3A]">
              {guest.butlerAssigned}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[#0B1F3A]">
            Direct Channel Active
          </span>
        </div>
      </div>
    </div>
  )
}
