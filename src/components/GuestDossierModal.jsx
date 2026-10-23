import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  PhoneCall,
  Mail,
  Clock,
  Edit3,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  History,
  Building,
} from 'lucide-react'
import guestsService from '../services/guestsService'

export default function GuestDossierModal({
  guest: propGuest,
  guestId,
  onClose,
  onGuestUpdated,
  onBookNewStay,
}) {
  const [loading, setLoading] = useState(false)
  const [guestData, setGuestData] = useState(null)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAnonymizing, setIsAnonymizing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Edit fields
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLanguage, setEditLanguage] = useState('en')
  const [editVip, setEditVip] = useState(false)
  const [editNotes, setEditNotes] = useState('')

  const activeId = guestId || propGuest?.id

  const loadGuestDetail = async () => {
    if (!activeId) {
      if (propGuest) {
        setGuestData(propGuest)
        populateEdit(propGuest)
      }
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await guestsService.getGuest(activeId)
      setGuestData(data)
      populateEdit(data)
    } catch (err) {
      console.warn('Failed to load guest dossier:', err.message)
      if (propGuest) {
        setGuestData(propGuest)
        populateEdit(propGuest)
      } else {
        setError(err.message || 'Could not load guest profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const populateEdit = (data) => {
    setEditFirstName(data.firstName || data.name?.split(' ')[0] || '')
    setEditLastName(data.lastName || data.name?.split(' ').slice(1).join(' ') || '')
    setEditEmail(data.email || '')
    setEditPhone(data.phone || '')
    setEditLanguage(data.language || 'en')
    setEditVip(Boolean(data.vip || data.vipLevel?.includes('VIP')))
    setEditNotes(data.notes || '')
  }

  useEffect(() => {
    loadGuestDetail()
  }, [activeId])

  if (!propGuest && !guestId) return null

  const guest = guestData || propGuest || {}
  const fullName = guest.firstName && guest.lastName
    ? `${guest.firstName} ${guest.lastName}`
    : guest.name || 'Guest'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const updated = await guestsService.updateGuest(guest.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim() || null,
        phone: editPhone.trim() || null,
        language: editLanguage.trim() || 'en',
        vip: editVip,
        notes: editNotes.trim() || null,
      })
      setGuestData(updated)
      setIsEditing(false)
      if (onGuestUpdated) onGuestUpdated(updated)
    } catch (err) {
      alert(err.message || 'Failed to update guest profile')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAnonymise = async () => {
    if (!window.confirm(`Are you sure you want to anonymize ${fullName}? All personal records will be permanently expunged under GDPR regulations.`)) {
      return
    }
    try {
      setActionLoading(true)
      await guestsService.anonymiseGuest(guest.id)
      setIsAnonymizing(false)
      await loadGuestDetail()
      if (onGuestUpdated) onGuestUpdated({ ...guest, anonymized: true })
      onClose()
    } catch (err) {
      alert(err.message || 'Failed to anonymize guest')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#000615]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_50px_rgba(11,31,58,0.25)] transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-[#E5E7EB]">
          {/* Header */}
          <div className="bg-[#0B1F3A] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A1C1B] border border-[#C9A227] text-[#ECC246] flex items-center justify-center font-bold text-sm shadow-xs">
                {initials || 'G'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-white">
                    {fullName}
                  </h3>
                  {guest.vip && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#ECC246] border border-[#C9A227]/40 uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>VIP Dossier</span>
                    </span>
                  )}
                  {guest.anonymized && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-600/50 text-gray-200 border border-gray-500 uppercase">
                      GDPR Anonymized
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#B5C7EA]">
                  Guest Profile ID: {guest.id} • Language: {guest.language?.toUpperCase() || 'EN'}
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

          {/* Dossier Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-7 h-7 text-[#C9A227] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">Loading guest records & stay history...</p>
              </div>
            ) : isEditing ? (
              /* Edit Profile Form */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                  <h4 className="font-headline font-bold text-sm text-[#0B1F3A]">Edit Guest Profile</h4>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-[#64748B] hover:text-[#0B1F3A]"
                  >
                    Cancel Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Language</label>
                    <input
                      type="text"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editVip}
                        onChange={(e) => setEditVip(e.target.checked)}
                        className="rounded text-[#C9A227] focus:ring-[#C9A227]"
                      />
                      <span className="text-xs font-bold text-[#0B1F3A]">VIP Loyalty Member</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">Concierge & Stay Notes</label>
                  <textarea
                    rows="3"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Guest preferences, room temperature, allergies..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#C9A227]" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* View Dossier Mode */
              <>
                {/* Contact & Loyalty Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9F9F7] p-4 rounded-xl border border-[#E5E7EB]">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Email Address
                    </span>
                    <span className="text-xs font-semibold text-[#0B1F3A] break-all">
                      {guest.email || 'Not on file'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Phone Number
                    </span>
                    <span className="text-xs font-semibold text-[#0B1F3A]">
                      {guest.phone || 'Not on file'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      VIP Status
                    </span>
                    <span className="text-xs font-bold text-[#C9A227]">
                      {guest.vip ? '⭐ VIP Tier 1' : 'Standard Guest'}
                    </span>
                  </div>
                </div>

                {/* Notes & Preferences */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                  <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block mb-1">
                    Concierge & Guest Preferences
                  </span>
                  <p className="text-xs text-[#0B1F3A]">
                    {guest.notes || 'No specific preferences recorded for this profile.'}
                  </p>
                </div>

                {/* Stay History Table */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-headline font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                      <History className="w-4 h-4 text-[#C9A227]" />
                      <span>Stay & Reservation History ({guest.stays?.length || 0})</span>
                    </h4>

                    {onBookNewStay && !guest.anonymized && (
                      <button
                        type="button"
                        onClick={() => {
                          onBookNewStay(guest)
                          onClose()
                        }}
                        className="h-7 px-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-[#ECC246] hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Building className="w-3 h-3 text-[#C9A227]" />
                        <span>Assign New Room</span>
                      </button>
                    )}
                  </div>

                  {guest.stays && guest.stays.length > 0 ? (
                    <div className="space-y-2">
                      {guest.stays.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0B1F3A]">
                                Suite {st.room?.number || st.roomId || 'Unassigned'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase font-bold">
                                {st.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#64748B] block mt-0.5">
                              {new Date(st.arrival).toLocaleDateString()} — {new Date(st.departure).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#0B1F3A]">
                            Stay #{st.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B] text-center py-4 bg-[#F9F9F7] rounded-xl border border-dashed border-[#E5E7EB]">
                      No historical stays recorded yet for this profile.
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={handleAnonymise}
                    disabled={actionLoading || guest.anonymized}
                    className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove all personal details under GDPR right to erasure"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>GDPR Anonymise Profile</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onBookNewStay && !guest.anonymized && (
                      <button
                        type="button"
                        onClick={() => {
                          onBookNewStay(guest)
                          onClose()
                        }}
                        className="h-8 px-3.5 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Building className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Book New Stay</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
