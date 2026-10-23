import React, { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

export default function DeleteRoomModal({
  isOpen,
  onClose,
  onConfirm,
  room,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !room) return null

  const roomNumber = room.number?.startsWith('Room') ? room.number : `Room ${room.number}`

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)
      await onConfirm(room.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(11,31,58,0.25)] border border-[#E5E7EB] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#DC2626] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-white">
                Delete Suite
              </h2>
              <p className="text-xs text-white/80">
                Permanent inventory removal confirmation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-1">
                Are you sure you want to delete {roomNumber}?
              </p>
              <p className="leading-relaxed">
                This unit will be removed from hotel inventory and the live room board. Any IoT devices connected to this room will be unassigned automatically.
              </p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] text-xs text-[#64748B] flex items-center justify-between">
            <span className="font-semibold text-[#0B1F3A]">Floor / Tier:</span>
            <span>
              Floor {room.floor?.number || room.floorNumber || room.floor || '1'} • {room.roomType?.name || room.roomType || room.tier || 'Standard'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
