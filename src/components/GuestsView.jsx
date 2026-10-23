import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Sparkles,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  RefreshCw,
  Loader2,
  Check,
  X,
  History,
} from 'lucide-react'
import guestsService from '../services/guestsService'
import GuestDossierModal from './GuestDossierModal'
import ReservationModal from './ReservationModal'

export default function GuestsView() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [vipOnly, setVipOnly] = useState(false)
  const [includeAnonymized, setIncludeAnonymized] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [bookingGuest, setBookingGuest] = useState(null)
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Create Guest Form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [isVip, setIsVip] = useState(false)
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadGuests = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const data = await guestsService.searchGuests({
        q: searchQuery.trim() || undefined,
        vip: vipOnly ? true : undefined,
        includeAnonymized: includeAnonymized ? true : undefined,
        limit: 50,
      })
      if (data?.items) {
        setGuests(data.items)
      }
    } catch (err) {
      console.warn('Failed to load guests:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGuests()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, vipOnly, includeAnonymized])

  const handleCreateGuest = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      const created = await guestsService.createGuest({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        language: language.trim() || 'en',
        vip: isVip,
        notes: notes.trim() || undefined,
      })
      showToast(`Guest profile created: ${created.firstName} ${created.lastName}`)
      setIsCreateModalOpen(false)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setNotes('')
      setIsVip(false)
      loadGuests(true)
    } catch (err) {
      alert(err.message || 'Failed to create guest profile')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            GUEST RELATIONS & CRM
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Guest Dossiers & Profiles
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dignitary directory, stay histories, VIP tiers, and GDPR compliance management
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadGuests(true)}
            disabled={refreshing}
            className="h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A227]" />
            <span>New Guest Profile</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0B1F3A]">
            <input
              type="checkbox"
              checked={vipOnly}
              onChange={(e) => setVipOnly(e.target.checked)}
              className="rounded text-[#C9A227] focus:ring-[#C9A227]"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>VIP Guests Only</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#64748B]">
            <input
              type="checkbox"
              checked={includeAnonymized}
              onChange={(e) => setIncludeAnonymized(e.target.checked)}
              className="rounded text-gray-500 focus:ring-gray-400"
            />
            <span>Include GDPR Anonymized</span>
          </label>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      {/* Guest Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#E5E7EB]">
          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#64748B]">Searching guest records...</p>
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#E5E7EB]">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-[#0B1F3A]">No guest profiles found</h3>
          <p className="text-xs text-[#64748B] mt-1">Try adjusting search filters or create a new guest</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((g) => {
            const name = `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Guest'
            const initials = name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#C9A227] transition-all duration-200 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B1F3A] text-[#C9A227] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        {initials || 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-headline font-bold text-sm text-[#0B1F3A] group-hover:text-[#C9A227] transition-colors">
                            {name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          ID: #{g.id} • Language: {g.language?.toUpperCase() || 'EN'}
                        </span>
                      </div>
                    </div>

                    {g.vip && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#B45309] border border-[#C9A227]/40 uppercase flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>VIP</span>
                      </span>
                    )}

                    {g.anonymized && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                        Anonymized
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-[#0B1F3A] bg-[#F9F9F7] p-3 rounded-xl border border-[#E5E7EB]/60">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{g.email || 'No email registered'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{g.phone || 'No phone registered'}</span>
                    </div>
                  </div>

                  {g.notes && (
                    <p className="text-[11px] text-[#64748B] mt-2.5 line-clamp-2 italic">
                      "{g.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3.5 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#64748B]">
                    Created {new Date(g.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="font-bold text-[#0B1F3A] group-hover:text-[#C9A227] flex items-center gap-1 transition-colors">
                    <span>Inspect Dossier</span>
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Guest Dossier Detail Modal */}
      <GuestDossierModal
        guest={selectedGuest}
        guestId={selectedGuest?.id}
        onClose={() => setSelectedGuest(null)}
        onGuestUpdated={() => loadGuests(true)}
        onBookNewStay={(g) => {
          setBookingGuest(g)
          setIsReservationOpen(true)
        }}
      />

      {/* Reservation & New Room Assignment Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => {
          setIsReservationOpen(false)
          setBookingGuest(null)
        }}
        initialGuest={bookingGuest}
        onConfirm={() => {
          showToast(`New room allocated successfully for ${bookingGuest?.firstName || 'Guest'}!`)
          loadGuests(true)
        }}
      />

      {/* New Guest Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0B1F3A] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#ECC246]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-white">
                    Create Guest Dossier
                  </h3>
                  <p className="text-[11px] text-[#B5C7EA]">
                    Add VIP profile or permanent hotel guest record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Marcus"
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sterling"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@luxury.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVip}
                      onChange={(e) => setIsVip(e.target.checked)}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span className="text-xs font-bold text-[#0B1F3A]">VIP Loyalty Member</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                  Concierge Notes & Preferences
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferences, suite requirements..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-8 px-4 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-[#C9A227]" />}
                  <span>Create Dossier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
