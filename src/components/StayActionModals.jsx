import { QRCodeSVG } from 'qrcode.react'
import React, { useState } from 'react'
import {
  Camera,
  Printer,
  QrCode,
  X,
  ArrowRightLeft,
  Calendar,
  KeyRound,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import staysService from '../services/staysService'

/**
 * Move Room Modal
 */
export function MoveRoomModal({ isOpen, onClose, stay, rooms = [], onSuccess }) {
  const [targetRoomId, setTargetRoomId] = useState('')
  const [reason, setReason] = useState('Guest requested room upgrade / quiet wing')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !stay) return null

  const handleMove = async (e) => {
    e.preventDefault()
    if (!targetRoomId) {
      setError('Please select a destination suite')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await staysService.moveRoom(stay.id, {
        roomId: Number(targetRoomId),
        reason: reason.trim() || undefined,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to move room')
    } finally {
      setLoading(false)
    }
  }

  const vacantRooms = rooms.filter((r) => r.id !== stay.room?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1F3A] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#ECC246]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-white">
                Reassign / Move Suite
              </h3>
              <p className="text-[11px] text-[#B5C7EA]">
                Current: Room {stay.room?.number || 'Unassigned'} • Guest: {stay.guest?.firstName} {stay.guest?.lastName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleMove} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Destination Suite *
            </label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227] bg-white"
            >
              <option value="">-- Choose target room --</option>
              {vacantRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.roomType?.name || r.roomType || 'Standard'}) {r.occupied ? '• Occupied' : '• Vacant'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              Operational Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-4 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5 text-[#C9A227]" />}
              <span>Execute Move</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Extend or Shorten Stay Modal
 */
export function ExtendStayModal({ isOpen, onClose, stay, onSuccess }) {
  const [departureDate, setDepartureDate] = useState(() => {
    if (stay?.departure) {
      return new Date(stay.departure).toISOString().split('T')[0]
    }
    return new Date(Date.now() + 86400000).toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !stay) return null

  const handleExtend = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const isoDeparture = new Date(`${departureDate}T11:00:00.000Z`).toISOString()
      await staysService.extendStay(stay.id, { departure: isoDeparture })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update departure')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1F3A] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#ECC246]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-white">
                Modify Departure Date
              </h3>
              <p className="text-[11px] text-[#B5C7EA]">
                Stay #{stay.id} • Room {stay.room?.number}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleExtend} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
              New Departure Date *
            </label>
            <input
              type="date"
              required
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-4 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />}
              <span>Save Departure</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Access Code Display Modal
 */
export function AccessCodeModal({ isOpen, onClose, codeData, stay }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('qr') // 'qr' or 'code'

  if (!isOpen || !codeData) return null

  const code = codeData.code || codeData.accessCode || (typeof codeData === 'string' ? codeData : '')
  const qrValue = codeData.qrPayload || codeData.qrUrl || codeData.qrToken || String(code)
  const guestName = stay?.guests?.[0]?.first_name
    ? `${stay.guests[0].first_name} ${stay.guests[0].last_name || ''}`.trim()
    : stay?.guest?.firstName
    ? `${stay.guest.firstName} ${stay.guest.lastName || ''}`.trim()
    : 'Registered Guest'
  const roomNumber = stay?.room?.number || stay?.roomNumber || 'Assigned Suite'
  const reference = stay?.reference || 'SmartStay'

  const handleCopy = () => {
    navigator.clipboard?.writeText(String(code))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F3A] text-[#C9A227] flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Digital Key & QR Access Pass
              </h3>
              <p className="text-[11px] text-[#64748B]">
                {roomNumber} · Ref: {reference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-[#0B1F3A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Scannable QR Pass
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white text-[#0B1F3A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            Backup Access Code
          </button>
        </div>

        {activeTab === 'qr' ? (
          <div className="py-2 flex flex-col items-center">
            {/* High-Contrast Luxury QR Card */}
            <div className="p-4 bg-white rounded-2xl border-2 border-[#C9A227] shadow-lg mb-3">
              {codeData.qrDataUrl ? (
                <img
                  src={codeData.qrDataUrl}
                  alt="Guest Access QR"
                  className="w-52 h-52 object-contain rounded-lg"
                />
              ) : (
                <QRCodeSVG
                  value={qrValue}
                  size={208}
                  level="M"
                  includeMargin={false}
                  fgColor="#0B1F3A"
                />
              )}
            </div>

            <p className="text-xs font-semibold text-[#0B1F3A] mt-1">
              {guestName} · Room {roomNumber}
            </p>
            <p className="text-[11px] text-[#64748B] max-w-xs mt-1">
              Guest can point their phone camera or open the SmartStay mobile app to scan and unlock immediately.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-xs text-[#64748B] mb-3">
              Give this 8-character access code to the guest if they prefer typing it into the app:
            </p>
            <div className="bg-[#F9F9F7] border-2 border-dashed border-[#C9A227] p-4 rounded-xl mb-3 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-[#0B1F3A]">
                {code}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#0B1F3A] transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
            {copied && <span className="text-[11px] text-emerald-600 font-medium">Copied to clipboard!</span>}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
          <button
            onClick={handlePrint}
            className="flex-1 h-9 rounded-xl border border-[#E5E7EB] hover:bg-[#F9F9F7] text-[#0B1F3A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Print Pass</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Admin Front Desk QR Scanner Modal
 * Scans physical vouchers, emails, or guest device passes for instant check-in
 */
export function AdminQrScannerModal({ isOpen, onClose, onCheckInSuccess }) {
  const [qrInput, setQrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [scannedResult, setScannedResult] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)

  if (!isOpen) return null

  const handleScanLookup = async (inputOverride) => {
    const dataToScan = (inputOverride || qrInput).trim()
    if (!dataToScan) return

    setLoading(true)
    setError(null)
    setScannedResult(null)

    try {
      const res = await staysService.scanGuestQr({ qrData: dataToScan })
      if (res && res.stay) {
        setScannedResult(res)
      } else {
        setError('No active reservation found for this QR code')
      }
    } catch (err) {
      setError(err?.message || 'Invalid or unrecognized QR code')
    } finally {
      setLoading(false)
    }
  }

  const handle1ClickCheckIn = async () => {
    if (!scannedResult?.stay?.id) return
    setCheckingIn(true)
    setError(null)

    try {
      await staysService.checkIn(scannedResult.stay.id)
      if (onCheckInSuccess) {
        onCheckInSuccess(scannedResult.stay)
      }
      onClose()
    } catch (err) {
      setError(err?.message || 'Check-in failed')
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5E7EB] overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A] text-[#C9A227] flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Front Desk QR Guest Scanner
              </h3>
              <p className="text-xs text-[#64748B]">
                Scan guest mobile pass, email voucher, or enter token for rapid arrival processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input & Scanner Form */}
        {!scannedResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#0B1F3A]">Ready for QR or Barcode Reader</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Scan with handheld scanner, paste QR payload, or enter booking reference
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleScanLookup()
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Paste QR payload, token, or reference (e.g. BK-84920)..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1 h-10 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0B1F3A] focus:outline-none focus:border-[#C9A227] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !qrInput.trim()}
                  className="h-10 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Scan</span>
                </button>
              </form>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Scanned Result Card */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase block">
                  RESERVATION VERIFIED
                </span>
                <h4 className="font-headline font-bold text-base text-[#0B1F3A] mt-0.5">
                  {scannedResult.stay.guests?.[0]?.first_name} {scannedResult.stay.guests?.[0]?.last_name}
                </h4>
                <p className="text-xs text-[#64748B]">
                  Booking Ref: <strong className="text-[#0B1F3A]">{scannedResult.stay.reference}</strong> · Suite: <strong className="text-[#0B1F3A]">{scannedResult.stay.room?.number || 'Unassigned'}</strong>
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                scannedResult.stay.status === 'checked_in'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {scannedResult.stay.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F9FA] p-3 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Arrival Date</span>
                <span className="font-semibold text-[#0B1F3A]">
                  {new Date(scannedResult.stay.arrival).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Departure Date</span>
                <span className="font-semibold text-[#0B1F3A]">
                  {new Date(scannedResult.stay.departure).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setScannedResult(null)
                  setQrInput('')
                }}
                className="flex-1 h-10 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 text-xs font-bold text-[#0B1F3A] transition-colors cursor-pointer"
              >
                Scan Another
              </button>
              {scannedResult.stay.status === 'reserved' ? (
                <button
                  onClick={handle1ClickCheckIn}
                  disabled={checkingIn}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {checkingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>1-Click Check In Guest</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl bg-[#0B1F3A] hover:bg-[#183153] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Edit Reservation Modal
 */
export function EditReservationModal({ isOpen, onClose, stay, rooms = [], onSuccess }) {
  const [adults, setAdults] = useState(stay?.adults || 1)
  const [children, setChildren] = useState(stay?.children || 0)
  const [roomId, setRoomId] = useState(stay?.roomId || stay?.room?.id || '')
  const [arrivalDate, setArrivalDate] = useState(
    stay?.arrival ? new Date(stay.arrival).toISOString().split('T')[0] : ''
  )
  const [departureDate, setDepartureDate] = useState(
    stay?.departure ? new Date(stay.departure).toISOString().split('T')[0] : ''
  )
  const [notes, setNotes] = useState(stay?.notes || '')
  const [companionFirst, setCompanionFirst] = useState('')
  const [companionLast, setCompanionLast] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !stay) return null

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const payload = {
        adults: Number(adults),
        children: Number(children),
        notes: notes.trim(),
      }
      if (stay.status === 'reserved') {
        if (roomId) payload.roomId = Number(roomId)
        if (arrivalDate) payload.arrival = new Date(arrivalDate).toISOString()
        if (departureDate) payload.departure = new Date(departureDate).toISOString()
      }
      if (companionFirst.trim() && companionLast.trim()) {
        payload.addGuests = [{ firstName: companionFirst.trim(), lastName: companionLast.trim() }]
      }

      await staysService.updateStay(stay.id, payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update reservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E5E7EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1F3A] px-5 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-sm text-white">
              Edit Reservation Details #{stay.reference || stay.id}
            </h3>
            <p className="text-[11px] text-[#B5C7EA]">
              Guest: {stay.guest?.firstName} {stay.guest?.lastName}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {stay.status === 'reserved' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1F3A] mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="hotel-input text-xs h-8"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1F3A] mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="hotel-input text-xs h-8"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1F3A] mb-1">
                  Assigned Suite
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="hotel-input text-xs h-8"
                >
                  <option value="">Unassigned (Assign at Check-In)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} ({r.roomType || 'Standard'}) - Floor {r.floor}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0B1F3A] mb-1">
                Adults
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="hotel-input text-xs h-8"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1F3A] mb-1">
                Children
              </label>
              <input
                type="number"
                min={0}
                max={4}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="hotel-input text-xs h-8"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0B1F3A] mb-1">
              Add Companion Guest (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First name"
                value={companionFirst}
                onChange={(e) => setCompanionFirst(e.target.value)}
                className="hotel-input text-xs h-8"
              />
              <input
                type="text"
                placeholder="Last name"
                value={companionLast}
                onChange={(e) => setCompanionLast(e.target.value)}
                className="hotel-input text-xs h-8"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0B1F3A] mb-1">
              Special Requests & Stay Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs baby cot, champagne on arrival"
              className="hotel-input text-xs py-1.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs h-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs h-8"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update Reservation</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
