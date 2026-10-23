import React, { useState, useEffect } from 'react'
import {
  Settings,
  Building,
  Thermometer,
  Leaf,
  Clock,
  Smartphone,
  Mail,
  Check,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  Star,
} from 'lucide-react'
import settingsService from '../services/settingsService'

export default function HotelSettingsView() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Settings state
  const [hotelName, setHotelName] = useState('SmartStay Hotel')
  const [acMinTemp, setAcMinTemp] = useState(18)
  const [acMaxTemp, setAcMaxTemp] = useState(28)
  const [ecoEnabled, setEcoEnabled] = useState(true)
  const [ecoDelayMinutes, setEcoDelayMinutes] = useState(30)
  const [ecoSetpoint, setEcoSetpoint] = useState(26)
  const [escalationMinutes, setEscalationMinutes] = useState(15)
  const [phonesPerRoom, setPhonesPerRoom] = useState(2)
  const [lowRatingThreshold, setLowRatingThreshold] = useState(2)
  const [alertEmailRecipients, setAlertEmailRecipients] = useState(['ops@smartstay.local'])
  const [newEmailInput, setNewEmailInput] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load settings
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getSettings()
      if (data) {
        if (data.hotel_name) setHotelName(data.hotel_name)
        if (data.ac_min_temp !== undefined) setAcMinTemp(data.ac_min_temp)
        if (data.ac_max_temp !== undefined) setAcMaxTemp(data.ac_max_temp)
        if (data.eco_enabled !== undefined) setEcoEnabled(Boolean(data.eco_enabled))
        if (data.eco_delay_minutes !== undefined) setEcoDelayMinutes(data.eco_delay_minutes)
        if (data.eco_setpoint !== undefined) setEcoSetpoint(data.eco_setpoint)
        if (data.escalation_minutes !== undefined) setEscalationMinutes(data.escalation_minutes)
        if (data.phones_per_room !== undefined) setPhonesPerRoom(data.phones_per_room)
        if (data.low_rating_threshold !== undefined) setLowRatingThreshold(data.low_rating_threshold)
        if (Array.isArray(data.alert_email_recipients)) setAlertEmailRecipients(data.alert_email_recipients)
      }
    } catch (err) {
      console.warn('Failed to load hotel settings:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        hotel_name: hotelName.trim(),
        ac_min_temp: Number(acMinTemp),
        ac_max_temp: Number(acMaxTemp),
        eco_enabled: Boolean(ecoEnabled),
        eco_delay_minutes: Number(ecoDelayMinutes),
        eco_setpoint: Number(ecoSetpoint),
        escalation_minutes: Number(escalationMinutes),
        phones_per_room: Number(phonesPerRoom),
        low_rating_threshold: Number(lowRatingThreshold),
        alert_email_recipients: alertEmailRecipients,
      }
      await settingsService.updateSettings(payload)
      showToast('Hotel operational parameters updated successfully.')
    } catch (err) {
      alert(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  // Add Email recipient
  const handleAddEmail = (e) => {
    e.preventDefault()
    const email = newEmailInput.trim()
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.')
      return
    }
    if (alertEmailRecipients.includes(email)) {
      alert('Email already exists in list.')
      return
    }
    setAlertEmailRecipients([...alertEmailRecipients, email])
    setNewEmailInput('')
  }

  // Remove Email recipient
  const handleRemoveEmail = (email) => {
    setAlertEmailRecipients(alertEmailRecipients.filter((item) => item !== email))
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-xl border border-white/10 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            HOTEL CONFIGURATION & PROPERTY RULES
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Property Operations Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure hotel name, HVAC safety thresholds, eco-mode setback timers, SLA escalation alerts, and guest rating triggers.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="btn-secondary text-xs h-9 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {loading ? (
        <div className="hotel-card py-16 text-center text-xs text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
          Loading hotel settings...
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Property Identity & Capacity */}
          <div className="hotel-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
              <Building className="w-4 h-4 text-[#0B1F3A]" />
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Property Identity & Mobile Devices
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Max Mobile Guest Keys Per Room
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={phonesPerRoom}
                  onChange={(e) => setPhonesPerRoom(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Simultaneous mobile app devices permitted to unlock each suite.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: HVAC & Eco Setback Rules */}
          <div className="hotel-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Climate & Eco Automation Guardrails
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Guest AC Min Temperature (°C)
                </label>
                <input
                  type="number"
                  min={15}
                  max={24}
                  value={acMinTemp}
                  onChange={(e) => setAcMinTemp(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Guest AC Max Temperature (°C)
                </label>
                <input
                  type="number"
                  min={24}
                  max={32}
                  value={acMaxTemp}
                  onChange={(e) => setAcMaxTemp(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Eco Mode Setpoint (°C)
                </label>
                <input
                  type="number"
                  min={20}
                  max={30}
                  value={ecoSetpoint}
                  onChange={(e) => setEcoSetpoint(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ecoEnabled}
                  onChange={(e) => setEcoEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B1F3A] focus:ring-[#C9A227]"
                />
                <span className="text-xs font-bold text-[#0B1F3A]">
                  Enable Automatic Eco-Mode Setback for Vacant / Unsold Rooms
                </span>
              </label>

              {ecoEnabled && (
                <div className="max-w-xs pl-7">
                  <label className="block text-xs font-medium text-[#64748B] mb-1">
                    Vacancy Delay Before Eco Activation (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={ecoDelayMinutes}
                    onChange={(e) => setEcoDelayMinutes(Number(e.target.value))}
                    className="hotel-input text-xs h-8"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: SLA Escalations & Quality Thresholds */}
          <div className="hotel-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                SLA Escalation & Quality Safeguards
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Guest Request Escalation Delay (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={escalationMinutes}
                  onChange={(e) => setEscalationMinutes(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Unfinished tickets auto-flag as Escalated after this duration.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Low Rating Alert Threshold (Stars)
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={lowRatingThreshold}
                  onChange={(e) => setLowRatingThreshold(Number(e.target.value))}
                  required
                  className="hotel-input text-xs h-9"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Reviews at or below this rating immediately dispatch staff notifications.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Email Recipients */}
          <div className="hotel-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
              <Mail className="w-4 h-4 text-[#C9A227]" />
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Operational Email Notification Broadcasts
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {alertEmailRecipients.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1F3A] text-white text-xs font-medium"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="Add manager email (e.g. gm@smartstay.local)"
                  className="hotel-input text-xs h-9"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="btn-secondary text-xs h-9 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recipient</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs h-10 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Operational Parameters</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
