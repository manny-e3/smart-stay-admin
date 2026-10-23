import React, { useState, useEffect, useRef } from 'react'
import {
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Refrigerator,
  Snowflake,
  Tv,
  Zap,
  ArrowRight,
  MoreVertical,
  AlertTriangle,
  BellRing,
  Moon,
  CheckCircle2,
  Edit3,
  Trash2,
  Eye,
} from 'lucide-react'

export default function IoTRoomCard({
  room,
  onOpenDetail,
  onToggleDevice,
  onEditRoom,
  onDeleteRoom,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [menuOpen])
  const statusLower = (room.status || '').toLowerCase()
  const isAlert = statusLower === 'alert' || (room.openAlerts && room.openAlerts > 0)
  const isRequest = statusLower === 'request' || (room.openRequests && room.openRequests > 0)
  const isDnd = statusLower === 'dnd' || room.dnd
  const isOccupied = statusLower === 'occupied' || (!isAlert && !isRequest && !isDnd && room.occupied)
  const isVacant = statusLower === 'vacant' || statusLower === 'available' || (!room.occupied && !isAlert && !isRequest)

  // Status border color matching theme
  const getBorderColor = () => {
    if (isAlert) return 'border-l-[4px] border-l-[#DC2626]'
    if (isRequest) return 'border-l-[4px] border-l-[#D97706]'
    if (isDnd) return 'border-l-[4px] border-l-[#7E22CE]'
    if (isOccupied) return 'border-l-[4px] border-l-[#16A34A]'
    return 'border-l-[4px] border-l-[#3B82F6]'
  }

  // Status Badge styles & labels
  const getStatusBadge = () => {
    if (isAlert) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
          <span>ALERT</span>
        </span>
      )
    }
    if (isRequest) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          <span>REQUEST</span>
        </span>
      )
    }
    if (isDnd) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#7E22CE]">
          <Moon className="w-2.5 h-2.5" />
          <span>DND</span>
        </span>
      )
    }
    if (isOccupied) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>OCCUPIED</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DBEAFE] text-[#1D4ED8]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
        <span>VACANT</span>
      </span>
    )
  }

  // Room devices state
  const deviceState = room.devices && typeof room.devices === 'object' && !Array.isArray(room.devices)
    ? room.devices
    : {
        light: true,
        fridge: true,
        ac: isOccupied,
        tv: false,
      }

  // Photos
  const photos = Array.isArray(room.images) && room.images.length > 0
    ? room.images
    : typeof room.images === 'string'
    ? (() => {
        try { return JSON.parse(room.images) } catch { return [] }
      })()
    : []
  const photoCount = photos.length || (room.imageUrl || room.image ? 1 : 0)
  let roomPhoto = room.imageUrl || photos[0] || room.image || '/luxury_hotel_suite_1792659405708.jpg'
  if (roomPhoto && roomPhoto.startsWith('/uploads/')) {
    roomPhoto = `http://localhost:5000${roomPhoto}`
  }

  // Normalized values
  const roomNumber = room.number?.startsWith('Room') ? room.number : `Room ${room.number}`
  const tierName = room.roomType?.name || room.tier || 'Deluxe Luxury Suite'
  const floorName = room.floor?.name || `Floor ${room.floor?.number || 1}`
  const guestDisplay = room.guest?.name || room.guest || (isOccupied ? 'Registered Guest' : 'Available for check-in')
  const tempDisplay = room.temp || (21 + (Number(room.id) % 4))
  const humidityDisplay = room.humidity || (42 + (Number(room.id) % 8))
  const iaqDisplay = room.iaq || '98 (Excel)'
  const energyDisplay = room.energy24h || Number((9.2 + (Number(room.id) % 5) * 1.3).toFixed(1))

  return (
    <div
      onClick={() => onOpenDetail(room)}
      className={`bg-white rounded-2xl border border-[#E5E7EB] ${getBorderColor()} shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04),0_1px_4px_-1px_rgba(11,31,58,0.02)] hover:shadow-[0_12px_28px_-4px_rgba(11,31,58,0.09)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group overflow-hidden cursor-pointer`}
    >
      <div className="p-5 sm:p-6">
        {/* Header: Thumbnail + Room ID + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail */}
            <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-[#E5E7EB] shadow-xs relative bg-[#0B1F3A]/5">
              <img
                src={roomPhoto}
                alt={roomNumber}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&auto=format&fit=crop&q=80'
                }}
              />
              {photoCount > 1 && (
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[#C9A227] text-[8px] font-bold shadow-xs">
                  {photoCount}📷
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A] leading-tight tracking-tight truncate">
                  {roomNumber}
                </h3>
                <span className="text-[11px] font-semibold text-[#7587A7] shrink-0">
                  {floorName}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 truncate font-medium">
                {tierName} • <span className="text-[#0B1F3A]">{guestDisplay}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative" ref={menuRef}>
            {/* Status Badge */}
            {getStatusBadge()}

            {/* Inspect / More button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0B1F3A] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              title="Suite Actions"
              aria-label="Suite options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Action Dropdown Menu */}
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 z-30 w-44 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(11,31,58,0.15)] border border-[#E5E7EB] py-1 animate-scale-up"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenDetail(room)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#0B1F3A] hover:bg-[#F9F9F7] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    if (onEditRoom) onEditRoom(room)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#0B1F3A] hover:bg-[#F9F9F7] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Edit Suite</span>
                </button>
                <div className="h-px bg-[#F1F5F9] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    if (onDeleteRoom) onDeleteRoom(room)
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#DC2626] hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Delete Suite</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Operational Highlights Banner if open requests or alerts */}
        {(room.openRequests > 0 || room.openAlerts > 0) && (
          <div className="mb-3.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs">
            {room.openAlerts > 0 ? (
              <span className="flex items-center gap-1 font-bold text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {room.openAlerts} Active Hardware Alert{room.openAlerts > 1 ? 's' : ''}
              </span>
            ) : null}
            {room.openRequests > 0 ? (
              <span className="flex items-center gap-1 font-bold text-amber-800">
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                {room.openRequests} Guest Request{room.openRequests > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        )}

        {/* Environmental Sensors Row (Temp, Humidity, IAQ) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 px-3.5 rounded-xl mb-4 bg-[#F9F9F7] border border-[#E5E7EB]">
          {/* Temperature */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-[#DC2626] p-2 rounded-lg bg-[#FEE2E2] shrink-0">
              <Thermometer className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-[#0B1F3A] leading-tight truncate">
                {tempDisplay}°C
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5 leading-none font-medium truncate">
                Ambient Temp
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-[#2563EB] p-2 rounded-lg bg-[#DBEAFE] shrink-0">
              <Droplets className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-[#0B1F3A] leading-tight truncate">
                {humidityDisplay}%
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5 leading-none font-medium truncate">
                Humidity
              </div>
            </div>
          </div>

          {/* Air Quality (IAQ) */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-[#0D9488] p-2 rounded-lg bg-[#CCFBF1] shrink-0">
              <Wind className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-[#0B1F3A] leading-tight truncate">
                {iaqDisplay}
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5 leading-none font-medium truncate">
                Air Quality
              </div>
            </div>
          </div>
        </div>

        {/* Smart Device Controls Row (Light, Fridge, AC, TV) */}
        <div className="grid grid-cols-4 gap-2.5 text-center">
          {/* Light */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onToggleDevice) onToggleDevice(room.id, 'light')
            }}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-between border transition-all duration-150 cursor-pointer active:scale-95 ${
              deviceState.light
                ? 'bg-[#FEF7DB] border-[#C9A227]/40 text-[#755B00] shadow-2xs'
                : 'bg-[#F9F9F7] border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B]'
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 mb-1 transition-colors ${
                deviceState.light
                  ? 'text-[#C9A227] fill-[#C9A227]/30'
                  : 'text-[#94A3B8]'
              }`}
            />
            <span className="text-[11px] font-semibold block mb-1">Light</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                deviceState.light
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {deviceState.light ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Fridge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onToggleDevice) onToggleDevice(room.id, 'fridge')
            }}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-between border transition-all duration-150 cursor-pointer active:scale-95 ${
              deviceState.fridge
                ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1D4ED8] shadow-2xs'
                : 'bg-[#F9F9F7] border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B]'
            }`}
          >
            <Refrigerator
              className={`w-4 h-4 mb-1 transition-colors ${
                deviceState.fridge ? 'text-[#2563EB]' : 'text-[#94A3B8]'
              }`}
            />
            <span className="text-[11px] font-semibold block mb-1">Fridge</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                deviceState.fridge
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {deviceState.fridge ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* AC */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onToggleDevice) onToggleDevice(room.id, 'ac')
            }}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-between border transition-all duration-150 cursor-pointer active:scale-95 ${
              deviceState.ac
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] shadow-2xs'
                : 'bg-[#F9F9F7] border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B]'
            }`}
          >
            <Snowflake
              className={`w-4 h-4 mb-1 transition-colors ${
                deviceState.ac ? 'text-[#059669]' : 'text-[#94A3B8]'
              }`}
            />
            <span className="text-[11px] font-semibold block mb-1">AC</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                deviceState.ac
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {deviceState.ac ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* TV */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onToggleDevice) onToggleDevice(room.id, 'tv')
            }}
            className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-between border transition-all duration-150 cursor-pointer active:scale-95 ${
              deviceState.tv
                ? 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED] shadow-2xs'
                : 'bg-[#F9F9F7] border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B]'
            }`}
          >
            <Tv
              className={`w-4 h-4 mb-1 transition-colors ${
                deviceState.tv ? 'text-[#7C3AED]' : 'text-[#94A3B8]'
              }`}
            />
            <span className="text-[11px] font-semibold block mb-1">TV</span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                deviceState.tv
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              {deviceState.tv ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Row: 24h Energy + Arrow button to open detail page */}
      <div
        className="px-5 sm:px-6 py-3.5 border-t border-[#F1F5F9] bg-[#F9F9F7] hover:bg-[#F4F4F2] flex items-center justify-between rounded-b-2xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#FEF7DB] text-[#C9A227]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-[#0B1F3A]">
              {energyDisplay} kWh
            </span>
            <span className="text-[11px] text-[#64748B]">24h Energy</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetail(room)
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] group-hover:text-[#C9A227] transition-all whitespace-nowrap cursor-pointer"
          aria-label={`Open details for ${roomNumber}`}
        >
          <span>View Room</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
