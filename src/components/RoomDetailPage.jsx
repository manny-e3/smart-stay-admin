import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Refrigerator,
  Snowflake,
  Tv,
  Zap,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Power,
  PhoneCall,
  Check,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit3,
  Trash2,
  Camera,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Sliders,
} from 'lucide-react'
import RoomModal from './RoomModal'
import DeleteRoomModal from './DeleteRoomModal'
import roomsService from '../services/roomsService'
import requestsService from '../services/requestsService'

export default function RoomDetailPage({
  room: propRoom,
  rooms = [],
  onBack,
  onUpdateRoom,
  onToggleDevice,
}) {
  const navigate = useNavigate()
  const { roomId } = useParams()

  const [loading, setLoading] = useState(true)
  const [roomDetail, setRoomDetail] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Interactive device state
  const [doorLocked, setDoorLocked] = useState(true)
  const [dndActive, setDndActive] = useState(false)
  const [targetTemp, setTargetTemp] = useState(22)
  const [hvacMode, setHvacMode] = useState('cool')
  const [fanSpeed, setFanSpeed] = useState('auto')
  const [devices, setDevices] = useState({
    light: true,
    fridge: true,
    ac: true,
    tv: false,
  })

  const [lightingZones, setLightingZones] = useState({
    master: 85,
    bedside: 40,
    terrace: 60,
    bath: 50,
  })

  const [localDustbinFill, setLocalDustbinFill] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch real room detail from backend: GET /admin/rooms/:roomId
  useEffect(() => {
    async function loadDetail() {
      const idToFetch = roomId || propRoom?.id || propRoom?.number
      if (!idToFetch) return

      try {
        setLoading(true)
        const data = await roomsService.getRoomDetail(idToFetch)
        if (data) {
          setRoomDetail(data)
          setDoorLocked(data.devices?.some((d) => d.type === 'lock' && d.state?.locked !== false))
          setDndActive(Boolean(data.dnd))

          // Initialize AC state from thermostat device if present
          const thermostat = data.devices?.find((d) => d.type === 'thermostat')
          if (thermostat?.state?.setpoint) {
            setTargetTemp(thermostat.state.setpoint)
          }
          if (thermostat?.state?.mode) {
            setHvacMode(thermostat.state.mode)
          }
        }
      } catch (err) {
        console.warn('Backend room detail fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [roomId, propRoom])

  const handleBack = () => {
    if (onBack) onBack()
    else navigate('/rooms')
  }

  // Normalized room data
  const currentRoom = roomDetail || propRoom || {}
  const roomNumber = currentRoom.number
    ? (String(currentRoom.number).startsWith('Room') ? currentRoom.number : `Room ${currentRoom.number}`)
    : `Room ${roomId || '101'}`
  const tierName = currentRoom.roomType?.name || 'Deluxe Luxury Suite'
  const floorName = currentRoom.floor?.name || `Floor ${currentRoom.floor?.number || 1}`
  const isOccupied = Boolean(currentRoom.occupied)
  const isAlert = currentRoom.status === 'alert' || (currentRoom.openAlerts && currentRoom.openAlerts > 0)
  const isDnd = currentRoom.status === 'dnd' || dndActive

  // Visual photo gallery state & URL normalization (must be declared before early returns)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const photos = useMemo(() => {
    const list = []
    if (Array.isArray(currentRoom.images) && currentRoom.images.length > 0) {
      list.push(...currentRoom.images.filter(Boolean))
    }
    if (currentRoom.imageUrl && !list.includes(currentRoom.imageUrl)) {
      list.unshift(currentRoom.imageUrl)
    }
    if (currentRoom.image && !list.includes(currentRoom.image)) {
      list.push(currentRoom.image)
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80')
    }
    return list
  }, [currentRoom.images, currentRoom.imageUrl, currentRoom.image])

  const resolvePhotoUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`
    }
    return url
  }

  // If loading room detail
  if (loading && !roomDetail) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-[#E5E7EB] text-center max-w-lg mx-auto">
        <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <h3 className="font-bold text-base text-[#0B1F3A]">Loading Suite Telemetry...</h3>
        <p className="text-xs text-[#64748B] mt-1">Reading IoT mesh endpoints from hotel server</p>
      </div>
    )
  }

  const toggleDevice = (key) => {
    setDevices((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      triggerToast(`${key.toUpperCase()} turned ${updated[key] ? 'ON' : 'OFF'}`)
      if (onToggleDevice && currentRoom.id) {
        onToggleDevice(currentRoom.id, key)
      }
      return updated
    })
  }

  const toggleDoorLock = () => {
    const newState = !doorLocked
    setDoorLocked(newState)
    triggerToast(newState ? 'Door Lock Engaged Securely' : 'Smart Deadbolt Disengaged (Door Unlocked)')
  }

  const toggleDnd = () => {
    const newState = !dndActive
    setDndActive(newState)
    triggerToast(newState ? 'Privacy Mode: Do Not Disturb Enabled' : 'Do Not Disturb Disabled')
  }

  const setLightingScene = (scene) => {
    if (scene === 'relaxation') {
      setLightingZones({ master: 35, bedside: 20, terrace: 40, bath: 30 })
      triggerToast('Ambience Scene: Relaxation Activated')
    } else if (scene === 'turndown') {
      setLightingZones({ master: 15, bedside: 30, terrace: 10, bath: 15 })
      triggerToast('Ambience Scene: Evening Turndown Activated')
    } else if (scene === 'full') {
      setLightingZones({ master: 100, bedside: 100, terrace: 100, bath: 100 })
      triggerToast('Ambience Scene: Full Illumination Activated')
    } else {
      setLightingZones({ master: 0, bedside: 0, terrace: 0, bath: 0 })
      triggerToast('All Suite Lights Switched OFF')
    }
  }

  const handleUpdateRoomDetail = async (payload) => {
    const id = currentRoom.id || roomId
    await roomsService.updateRoom(id, payload)
    if (onUpdateRoom) {
      onUpdateRoom(id, payload)
    }
    triggerToast('Suite specifications updated successfully')
    const refreshed = await roomsService.getRoomDetail(id)
    if (refreshed) setRoomDetail(refreshed)
  }

  const handleDeleteRoomDetail = async () => {
    const id = currentRoom.id || roomId
    await roomsService.deleteRoom(id)
    triggerToast('Suite removed from hotel inventory')
    navigate('/rooms')
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-bold text-[#0B1F3A] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rooms Grid</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-headline font-bold text-xl text-[#0B1F3A]">
                {roomNumber}
              </h1>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-sm font-semibold text-[#0B1F3A]">
                {tierName}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isAlert
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : isOccupied
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#DBEAFE] text-[#1D4ED8]'
                }`}
              >
                {currentRoom.status || (isOccupied ? 'Occupied' : 'Vacant')}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {floorName} • Telemetry Active • Device ID: {currentRoom.id || roomId}
            </p>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleDoorLock}
            className={`h-9 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              doorLocked
                ? 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-[#F9F9F7]'
                : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
            }`}
          >
            {doorLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Door Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Door Unlocked</span>
              </>
            )}
          </button>

          <button
            onClick={toggleDnd}
            className={`h-9 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              dndActive
                ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#B45309]'
                : 'bg-white border-[#E5E7EB] text-[#0B1F3A] hover:bg-[#F9F9F7]'
            }`}
          >
            {dndActive ? (
              <>
                <BellOff className="w-3.5 h-3.5 text-[#B45309]" />
                <span>DND Active</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Privacy Off</span>
              </>
            )}
          </button>

          <button
            onClick={() => triggerToast(`Front Desk alerted for ${roomNumber}`)}
            className="h-9 px-4 rounded-lg bg-[#C9A227] hover:bg-[#B58F1F] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Notify Concierge</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Edit suite specifications"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Edit Suite</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-9 px-3.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] hover:bg-red-100 text-xs font-semibold text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Delete suite"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Suite Photography & Visual Gallery Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A]/5 border border-[#E5E7EB] flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Suite Visual Gallery
              </h3>
              <p className="text-xs text-[#64748B]">
                {photos.length} Photo{photos.length > 1 ? 's' : ''} attached to this unit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9F9F7] hover:bg-white text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Add / Manage Pictures</span>
          </button>
        </div>

        {/* Hero Photo with navigation */}
        <div className="relative rounded-xl overflow-hidden aspect-21/9 bg-[#0B1F3A]/5 border border-[#E5E7EB] group max-h-[380px]">
          <img
            src={resolvePhotoUrl(photos[activePhotoIndex] || photos[0])}
            alt={`${roomNumber} view ${activePhotoIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80'
            }}
          />

          {/* Photo Counter Pill */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <span>Photo {activePhotoIndex + 1} of {photos.length}</span>
          </div>

          {/* Previous / Next buttons if multiple photos */}
          {photos.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1">
            {photos.map((p, idx) => (
              <button
                key={`${p}-${idx}`}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-24 h-15 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activePhotoIndex === idx
                    ? 'border-[#C9A227] shadow-sm scale-102 ring-2 ring-[#C9A227]/30'
                    : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={resolvePhotoUrl(p)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Climate Controller & Architectural Lighting */}
        <div className="lg:col-span-7 space-y-6">
          {/* Climate Controller */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-5">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Precision Climate & HVAC Control
                </h3>
                <p className="text-xs text-[#64748B]">
                  Smart thermostat integrated via hotel BACnet / Zigbee adapter
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Adapter Online</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Dial Representation */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-6 bg-[#F9F9F7] rounded-2xl border border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Target Setpoint
                </span>
                <div className="font-headline font-bold text-4xl text-[#0B1F3A] tracking-tight">
                  {targetTemp}°C
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">
                  Ambient: 22.4°C
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      const newT = Math.max(18, targetTemp - 0.5)
                      setTargetTemp(newT)
                      triggerToast(`Setpoint lowered to ${newT}°C`)
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#0B1F3A] font-bold hover:bg-[#F4F4F2] cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      const newT = Math.min(28, targetTemp + 0.5)
                      setTargetTemp(newT)
                      triggerToast(`Setpoint raised to ${newT}°C`)
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#0B1F3A] font-bold hover:bg-[#F4F4F2] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Environmental Telemetry */}
              <div className="sm:col-span-7 space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#DBEAFE] text-[#2563EB]">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B1F3A]">Relative Humidity</span>
                      <div className="text-[11px] text-[#64748B]">Optimal comfort zone</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#0B1F3A]">46%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#CCFBF1] text-[#0D9488]">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0B1F3A]">Indoor Air Quality</span>
                      <div className="text-[11px] text-[#64748B]">CO2: 480 ppm (Fresh Alpine Air)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                    EXCELLENT
                  </span>
                </div>
              </div>
            </div>

            {/* Modes & Fan Speed */}
            <div className="mt-6 pt-5 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Operating Mode:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['cool', 'heat', 'eco', 'auto'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setHvacMode(m)
                        triggerToast(`HVAC Mode set to ${m.toUpperCase()}`)
                      }}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        hvacMode === m
                          ? 'bg-[#0B1F3A] text-white shadow-xs'
                          : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Airflow Speed:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['low', 'med', 'high', 'auto'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFanSpeed(f)
                        triggerToast(`Airflow set to ${f.toUpperCase()}`)
                      }}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        fanSpeed === f
                          ? 'bg-[#C9A227] text-white shadow-xs'
                          : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Dustbin & Waste Telemetry Card */}
          {(() => {
            const dustbinDevice = currentRoom.devices?.find(
              (d) =>
                d.name?.toLowerCase().includes('dustbin') ||
                d.externalId?.includes('bin-waste') ||
                (d.type === 'sensor' && d.name?.includes('Dustbin'))
            )
            const currentDustbinFill = localDustbinFill !== null ? localDustbinFill : (dustbinDevice?.state?.fillLevel ?? 42)
            const dustbinBattery = dustbinDevice?.state?.battery ?? 94
            const isDustbinFull = currentDustbinFill >= 85

            return (
              <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isDustbinFull ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                        Smart Dustbin & Waste Telemetry
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Ultrasonic fill sensor ({dustbinDevice?.externalId || `bin-waste-${roomNumber}`})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      isDustbinFull
                        ? 'bg-[#FEE2E2] text-[#DC2626] animate-pulse'
                        : 'bg-[#ECFDF5] text-[#059669]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDustbinFull ? 'bg-[#DC2626]' : 'bg-[#10B981]'}`} />
                    <span>{isDustbinFull ? 'Fill Alert (>=85%)' : 'Optimal Capacity'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Fill Level Gauge */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-6 bg-[#F9F9F7] rounded-2xl border border-[#E5E7EB]">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Waste Fill Capacity
                    </span>
                    <div className={`font-headline font-bold text-4xl tracking-tight ${isDustbinFull ? 'text-[#DC2626]' : 'text-[#0B1F3A]'}`}>
                      {currentDustbinFill}%
                    </div>
                    <div className="w-full bg-[#E5E7EB] h-2.5 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDustbinFull
                            ? 'bg-[#DC2626]'
                            : currentDustbinFill >= 50
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${Math.min(100, currentDustbinFill)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-2 font-mono">
                      Threshold: 85% • Volume: 25L
                    </div>
                  </div>

                  {/* Sensor Health Diagnostics & Empty Action */}
                  <div className="sm:col-span-7 space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B1F3A]">IoT Battery Level:</span>
                      <span className="text-xs font-bold text-[#059669]">{dustbinBattery}% (Healthy)</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B1F3A]">Bin Lid Seal:</span>
                      <span className="text-xs font-semibold text-[#0B1F3A]">Closed & Odor Sealed</span>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setLocalDustbinFill(0)
                          triggerToast(`Room ${roomNumber} Smart Dustbin marked emptied. Sensor reset to 0%.`)
                        }}
                        className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Mark Bin Emptied</span>
                      </button>

                      {isDustbinFull && (
                        <button
                          onClick={async () => {
                            try {
                              await requestsService.createRequest({
                                roomId: currentRoom.id,
                                category: 'housekeeping',
                                description: `Automated: Suite ${roomNumber} Smart Dustbin reached ${currentDustbinFill}% capacity. Please empty.`,
                                priority: 'urgent',
                              })
                              triggerToast(`Housekeeping porter dispatched for Room ${roomNumber}!`)
                            } catch (e) {
                              triggerToast('Porter dispatch error')
                            }
                          }}
                          className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Dispatch Porter</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Architectural Lighting Scenes */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Architectural Lighting Zones & Scenes
              </h3>
              <span className="text-xs text-[#64748B]">Direct IoT Dimmer Mesh</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setLightingScene('relaxation')}
                className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] hover:bg-[#F4F4F2] text-left transition-colors cursor-pointer"
              >
                <Sun className="w-4 h-4 text-[#F59E0B] mb-1" />
                <div className="text-xs font-bold text-[#0B1F3A]">Relaxation</div>
                <div className="text-[10px] text-[#64748B]">Warm 2400K</div>
              </button>

              <button
                onClick={() => setLightingScene('turndown')}
                className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] hover:bg-[#F4F4F2] text-left transition-colors cursor-pointer"
              >
                <Moon className="w-4 h-4 text-[#818CF8] mb-1" />
                <div className="text-xs font-bold text-[#0B1F3A]">Turndown</div>
                <div className="text-[10px] text-[#64748B]">Night Dim 15%</div>
              </button>

              <button
                onClick={() => setLightingScene('full')}
                className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] hover:bg-[#F4F4F2] text-left transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C9A227] mb-1" />
                <div className="text-xs font-bold text-[#0B1F3A]">Full Bright</div>
                <div className="text-[10px] text-[#64748B]">100% Lumens</div>
              </button>

              <button
                onClick={() => setLightingScene('off')}
                className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] hover:bg-[#F4F4F2] text-left transition-colors cursor-pointer"
              >
                <Power className="w-4 h-4 text-[#EF4444] mb-1" />
                <div className="text-xs font-bold text-[#0B1F3A]">All Off</div>
                <div className="text-[10px] text-[#64748B]">Power Standby</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Connected Devices & Live Requests/Alerts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Connected Smart Devices Hub */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Connected Hardware Devices
                </h3>
                <p className="text-xs text-[#64748B]">
                  {currentRoom.devices?.length || 4} units linked to adapter
                </p>
              </div>
            </div>

            {/* List Devices from Backend */}
            <div className="space-y-2.5">
              {currentRoom.devices && currentRoom.devices.length > 0 ? (
                currentRoom.devices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0B1F3A]">
                        {dev.type === 'lock' ? (
                          <Lock className="w-4 h-4 text-[#16A34A]" />
                        ) : dev.type === 'thermostat' ? (
                          <Snowflake className="w-4 h-4 text-[#2563EB]" />
                        ) : dev.type === 'light' ? (
                          <Lightbulb className="w-4 h-4 text-[#C9A227]" />
                        ) : dev.type === 'meter' ? (
                          <Zap className="w-4 h-4 text-[#F59E0B]" />
                        ) : (
                          <Sliders className="w-4 h-4 text-[#64748B]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B1F3A]">{dev.name}</div>
                        <div className="text-[10px] text-[#64748B]">
                          ID: {dev.externalId} • {dev.adapter || 'Demo devices'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dev.online !== false
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}
                    >
                      {dev.online !== false ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => toggleDevice('light')}
                    className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-[#C9A227] mb-1" />
                    <div className="font-bold text-[#0B1F3A]">Master Light</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Active</div>
                  </div>
                  <div
                    onClick={() => toggleDevice('ac')}
                    className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] cursor-pointer"
                  >
                    <Snowflake className="w-4 h-4 text-[#2563EB] mb-1" />
                    <div className="font-bold text-[#0B1F3A]">Climate AC</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Active</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Guest Requests & History from Backend */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Room Requests & History
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">
                {currentRoom.requests?.length || 0} Tickets
              </span>
            </div>

            {currentRoom.requests && currentRoom.requests.length > 0 ? (
              <div className="space-y-2.5">
                {currentRoom.requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#0B1F3A] capitalize">
                        {req.category} Request
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#3730A3] uppercase">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[#64748B] text-[11px]">{req.description}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] text-center py-4">
                No active service requests for this suite.
              </p>
            )}
          </div>

          {/* Active Hardware Incidents / Alerts from Backend */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Hardware Incidents
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626]">
                {currentRoom.alerts?.length || 0} Incidents
              </span>
            </div>

            {currentRoom.alerts && currentRoom.alerts.length > 0 ? (
              <div className="space-y-2.5">
                {currentRoom.alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>{alt.title}</span>
                      </span>
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                        {alt.severity}
                      </span>
                    </div>
                    {alt.message && <p className="text-[11px] text-red-700">{alt.message}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium text-center py-4 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero hardware faults detected</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Room Modal */}
      <RoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateRoomDetail}
        room={currentRoom}
      />

      {/* Delete Room Confirmation Modal */}
      <DeleteRoomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRoomDetail}
        room={currentRoom}
      />
    </div>
  )
}
