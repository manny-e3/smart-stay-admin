import React, { useState, useEffect } from 'react'
import {
  X,
  Check,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  Building,
  Loader2,
  Mail,
  Phone,
  BedDouble,
  Search,
  History,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import staysService from '../services/staysService'
import roomsService from '../services/roomsService'
import guestsService from '../services/guestsService'

export default function ReservationModal({ isOpen, onClose, onConfirm, initialGuest = null }) {
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [guestSearchQuery, setGuestSearchQuery] = useState('')
  const [guestSearchResults, setGuestSearchResults] = useState([])
  const [isSearchingGuest, setIsSearchingGuest] = useState(false)
  const [guestStaysHistory, setGuestStaysHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isVip, setIsVip] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [roomType, setRoomType] = useState('Suite')
  const [arrivalDate, setArrivalDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3)
    return d.toISOString().split('T')[0]
  })
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [specialRequests, setSpecialRequests] = useState('Welcome champagne & high-floor suite allocation')
  const [checkInNow, setCheckInNow] = useState(false)

  const [availableRooms, setAvailableRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Load detailed guest profile and stay history
  const selectAndLoadGuest = async (g) => {
    setSelectedGuest(g)
    setFirstName(g.firstName || g.name?.split(' ')[0] || '')
    setLastName(g.lastName || g.name?.split(' ').slice(1).join(' ') || '')
    setEmail(g.email || '')
    setPhone(g.phone || '')
    setIsVip(Boolean(g.vip))
    if (g.notes) {
      setSpecialRequests((prev) => (prev ? `${prev}\n[Preferences]: ${g.notes}` : g.notes))
    }
    setGuestSearchResults([])
    setGuestSearchQuery('')

    try {
      setLoadingHistory(true)
      const full = await guestsService.getGuest(g.id)
      if (full?.stays) {
        setGuestStaysHistory(full.stays)
      } else {
        setGuestStaysHistory(g.stays || [])
      }
    } catch (err) {
      console.warn('Could not load guest past stays:', err.message)
      setGuestStaysHistory(g.stays || [])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleClearSelectedGuest = () => {
    setSelectedGuest(null)
    setGuestStaysHistory([])
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setIsVip(false)
  }

  // Pre-fill if initialGuest was provided
  useEffect(() => {
    if (isOpen && initialGuest) {
      selectAndLoadGuest(initialGuest)
    } else if (isOpen && !initialGuest) {
      handleClearSelectedGuest()
    }
  }, [isOpen, initialGuest])

  // Live guest search debounce
  useEffect(() => {
    if (!guestSearchQuery.trim() || guestSearchQuery.trim().length < 2) {
      setGuestSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingGuest(true)
        const res = await guestsService.searchGuests({ q: guestSearchQuery.trim(), limit: 5 })
        if (res?.items) {
          setGuestSearchResults(res.items)
        }
      } catch (err) {
        console.warn('Guest search failed:', err.message)
      } finally {
        setIsSearchingGuest(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [guestSearchQuery])

  useEffect(() => {
    if (!isOpen) return
    async function loadRooms() {
      try {
        setLoadingRooms(true)
        const board = await roomsService.getRoomBoard()
        const flat = []
        if (board?.floors) {
          board.floors.forEach((f) => {
            if (f.rooms) {
              f.rooms.forEach((r) => flat.push(r))
            }
          })
        }
        setAvailableRooms(flat)
        if (flat.length > 0 && !roomId) {
          const firstVacant = flat.find((r) => !r.occupied) || flat[0]
          setRoomId(firstVacant.id)
          setRoomType(firstVacant.roomType?.name || firstVacant.roomType || 'Standard')
        }
      } catch (err) {
        console.warn('Failed to load rooms for reservation:', err.message)
      } finally {
        setLoadingRooms(false)
      }
    }
    loadRooms()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const guestPayload = selectedGuest?.id
        ? {
            id: selectedGuest.id,
            firstName: firstName.trim() || selectedGuest.firstName,
            lastName: lastName.trim() || selectedGuest.lastName,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            vip: isVip,
          }
        : {
            firstName: firstName.trim() || 'Valued',
            lastName: lastName.trim() || 'Guest',
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            vip: isVip,
          }

      const payload = {
        guest: guestPayload,
        roomId: roomId ? Number(roomId) : undefined,
        roomType,
        arrival: new Date(`${arrivalDate}T14:00:00.000Z`).toISOString(),
        departure: new Date(`${departureDate}T11:00:00.000Z`).toISOString(),
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        notes: specialRequests.trim() || undefined,
        checkInNow,
      }

      const created = await staysService.createStay(payload)
      if (onConfirm) onConfirm(created)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create reservation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000615]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_50px_rgba(11,31,58,0.25)] transition-all sm:my-8 sm:w-full sm:max-w-xl border border-[#E5E7EB]">
          {/* Header */}
          <div className="bg-[#0B1F3A] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#ECC246]">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg leading-6 tracking-wide text-white">
                  New Reservation & Stay Allocation
                </h3>
                <p className="text-xs text-[#B5C7EA] mt-0.5">
                  Direct backend PMS & Stays ledger integration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Returning Guest Search Bar */}
            <div className="bg-[#F9F9F7] p-3.5 rounded-xl border border-[#E5E7EB] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0B1F3A] flex items-center gap-1.5 uppercase tracking-wide">
                  <History className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Returning Guest Lookup & History</span>
                </span>
                {selectedGuest && (
                  <button
                    type="button"
                    onClick={handleClearSelectedGuest}
                    className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear / New Guest</span>
                  </button>
                )}
              </div>

              {!selectedGuest ? (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                    placeholder="Search by returning customer name, email, or phone..."
                    className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#C9A227]"
                  />
                  {isSearchingGuest && (
                    <Loader2 className="w-3.5 h-3.5 text-[#C9A227] animate-spin absolute right-3 top-2.5" />
                  )}

                  {/* Autocomplete Dropdown */}
                  {guestSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-30 divide-y divide-[#F1F5F9] max-h-48 overflow-y-auto">
                      {guestSearchResults.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => selectAndLoadGuest(g)}
                          className="p-2.5 hover:bg-[#F9F9F7] transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0B1F3A]">
                                {g.firstName} {g.lastName}
                              </span>
                              {g.vip && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#C9A227]/20 text-[#B45309] border border-[#C9A227]/40">
                                  VIP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#64748B]">
                              {g.email || g.phone || `Guest #${g.id}`}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#0B1F3A] bg-[#0B1F3A]/5 px-2 py-0.5 rounded-full">
                            Select Profile
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Returning Guest Dossier Banner */
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0B1F3A] text-sm">
                        {firstName} {lastName}
                      </span>
                      {isVip && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A227] text-white">
                          VIP Tier
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-[#64748B]">
                      Profile #{selectedGuest.id}
                    </span>
                  </div>

                  {/* Historical Rooms & Stay Log */}
                  <div className="pt-2 border-t border-amber-200/60 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0B1F3A]">
                      <History className="w-3 h-3 text-[#C9A227]" />
                      <span>
                        <strong>Stay History:</strong> {loadingHistory ? 'Loading history...' : `${guestStaysHistory.length} past stays recorded`}
                      </span>
                    </div>

                    {guestStaysHistory.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[#64748B] flex-wrap">
                        <span>Previously occupied:</span>
                        {[...new Set(guestStaysHistory.map((s) => s.room?.number || s.roomId).filter(Boolean))].map((rNum) => (
                          <span
                            key={rNum}
                            className="font-bold text-[#0B1F3A] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]"
                          >
                            Suite {rNum}
                          </span>
                        ))}
                      </div>
                    )}

                    {selectedGuest.notes && (
                      <div className="text-[11px] text-[#B45309] italic mt-1">
                        Preferences: "{selectedGuest.notes}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guest Details */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#F1F5F9] pb-1">
                Guest Dossier & Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vance"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-1 block">
                    Guest credentials & mobile app access code will be emailed automatically.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                />
                <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>VIP Guest Designation (Expedited Itinerary & Concierge Attention)</span>
                </span>
              </label>
            </div>

            {/* Room Allocation */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#F1F5F9] pb-1">
                Room Allocation & Dates
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Assigned Suite
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => {
                      const selectedId = e.target.value
                      setRoomId(selectedId)
                      const found = availableRooms.find((r) => String(r.id) === String(selectedId))
                      if (found) {
                        const typeName = found.roomType?.name || found.roomType || 'Standard'
                        setRoomType(typeName)
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227] bg-white"
                  >
                    <option value="">-- Unassigned (Allocate Later) --</option>
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.number} ({r.roomType?.name || r.roomType || 'Standard'}) {r.occupied ? '• Currently Occupied' : '• Vacant'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Suite Tier Category
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227] bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                Special Requests & Notes
              </label>
              <textarea
                rows="2"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Allergies, high-floor preference, champagne service..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            {/* Check-in Now Toggle */}
            <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Check-in Immediately
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Mark stay as in-house active right away and generate digital access tokens
                </span>
              </div>
              <input
                type="checkbox"
                checked={checkInNow}
                onChange={(e) => setCheckInNow(e.target.checked)}
                className="h-4 w-4 text-[#C9A227] rounded focus:ring-[#C9A227] cursor-pointer"
              />
            </div>

            {/* Submit / Cancel Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Confirm Reservation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
