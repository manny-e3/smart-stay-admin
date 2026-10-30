import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  BedDouble,
  Layers,
  Sparkles,
  AlertCircle,
  Check,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  DollarSign,
  Lock,
  Snowflake,
  Lightbulb,
  Tv,
  Zap,
  Volume2,
  Cpu,
  Sliders,
  Radio,
  Phone,
} from 'lucide-react'
import roomsService from '../services/roomsService'

const STANDARD_ROOM_TYPES = [
  'Standard King',
  'Deluxe Suite',
  'Executive Penthouse',
  'Presidential Suite',
  'Garden Villa',
  'Oceanfront Suite',
  'Heritage Suite',
]

const DEFAULT_PRICES = {
  'Standard King': 180,
  'Deluxe Suite': 280,
  'Executive Penthouse': 550,
  'Presidential Suite': 1200,
  'Garden Villa': 750,
  'Oceanfront Suite': 620,
  'Heritage Suite': 450,
}

const LUXURY_PRESETS = [
  {
    name: 'Executive Suite',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Presidential Bedroom',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Deluxe Living Room',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Luxury Spa Bath',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Garden Villa',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Oceanfront Balcony',
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
  },
]

const DEVICE_TYPE_OPTIONS = [
  { value: 'lock', label: 'Door Lock', icon: Lock },
  { value: 'thermostat', label: 'Climate / HVAC', icon: Snowflake },
  { value: 'light', label: 'Lighting Zone', icon: Lightbulb },
  { value: 'curtain', label: 'Curtain / Drapes', icon: Sliders },
  { value: 'tv', label: 'Smart TV', icon: Tv },
  { value: 'speaker', label: 'Audio / Speaker', icon: Volume2 },
  { value: 'sensor', label: 'Sensor / Dustbin', icon: Radio },
  { value: 'meter', label: 'Power Meter', icon: Zap },
  { value: 'phone', label: 'VoIP Phone', icon: Phone },
  { value: 'other', label: 'Custom IoT', icon: Cpu },
]

const DEVICE_PRESETS = {
  Standard: [
    { name: 'Smart Keyless Door Lock', type: 'lock', isActive: true },
    { name: 'Master Suite Lighting', type: 'light', isActive: true },
    { name: 'Precision Climate AC', type: 'thermostat', isActive: true },
    { name: 'Smart Dustbin Telemetry', type: 'sensor', isActive: true },
  ],
  Deluxe: [
    { name: 'Smart Keyless Door Lock', type: 'lock', isActive: true },
    { name: 'Master Suite Lighting', type: 'light', isActive: true },
    { name: 'Bedside Reading Dimmer', type: 'light', isActive: true },
    { name: 'Precision Climate AC', type: 'thermostat', isActive: true },
    { name: 'Smart 4K Hospitality TV', type: 'tv', isActive: true },
    { name: 'Smart Dustbin Telemetry', type: 'sensor', isActive: true },
  ],
  Penthouse: [
    { name: 'Smart Keyless Door Lock', type: 'lock', isActive: true },
    { name: 'Master Suite Lighting', type: 'light', isActive: true },
    { name: 'Bedside Reading Dimmer', type: 'light', isActive: true },
    { name: 'Architectural Terrace Lights', type: 'light', isActive: true },
    { name: 'Precision Dual-Zone AC', type: 'thermostat', isActive: true },
    { name: 'Smart 4K Hospitality TV', type: 'tv', isActive: true },
    { name: 'Motorized Drapery Curtains', type: 'curtain', isActive: true },
    { name: 'High-Fidelity Soundbar', type: 'speaker', isActive: true },
    { name: 'Smart Dustbin Telemetry', type: 'sensor', isActive: true },
    { name: 'Real-time Power Meter', type: 'meter', isActive: true },
  ],
  Minimal: [
    { name: 'Smart Keyless Door Lock', type: 'lock', isActive: true },
    { name: 'Master Suite Lighting', type: 'light', isActive: true },
  ],
}

function getDeviceIcon(type) {
  switch (type) {
    case 'lock':
      return Lock
    case 'thermostat':
      return Snowflake
    case 'light':
      return Lightbulb
    case 'curtain':
      return Sliders
    case 'tv':
      return Tv
    case 'speaker':
      return Volume2
    case 'sensor':
      return Radio
    case 'meter':
      return Zap
    case 'phone':
      return Phone
    default:
      return Cpu
  }
}

export default function RoomModal({
  isOpen,
  onClose,
  onSubmit,
  room = null, // null for Create mode, object for Edit mode
}) {
  const isEdit = Boolean(room)
  const fileInputRef = useRef(null)

  const [number, setNumber] = useState('')
  const [floor, setFloor] = useState('1')
  const [roomType, setRoomType] = useState('Deluxe Suite')
  const [basePrice, setBasePrice] = useState('')
  const [customRoomType, setCustomRoomType] = useState('')
  const [isCustomType, setIsCustomType] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [dnd, setDnd] = useState(false)

  // Pictures & Gallery state
  const [images, setImages] = useState([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)

  // Connected Hardware Devices state for this specific room
  const [roomDevices, setRoomDevices] = useState([])
  const [newDeviceName, setNewDeviceName] = useState('')
  const [newDeviceType, setNewDeviceType] = useState('light')
  const [isAddingDevice, setIsAddingDevice] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Populate form when room changes
  useEffect(() => {
    if (room) {
      setNumber(room.number || '')
      setFloor(
        room.floor?.number !== undefined
          ? String(room.floor.number)
          : room.floorNumber !== undefined
          ? String(room.floorNumber)
          : room.floor !== undefined
          ? String(room.floor)
          : '1'
      )

      const typeName = room.roomType?.name || room.roomType || room.tier || ''
      if (STANDARD_ROOM_TYPES.includes(typeName)) {
        setRoomType(typeName)
        setIsCustomType(false)
        setCustomRoomType('')
      } else if (typeName) {
        setRoomType('Custom')
        setIsCustomType(true)
        setCustomRoomType(typeName)
      } else {
        setRoomType(STANDARD_ROOM_TYPES[0])
        setIsCustomType(false)
      }

      setIsActive(room.isActive !== false)
      setDnd(Boolean(room.dnd))

      // Price population (handles basePrice, price, base_price)
      const p = room.basePrice ?? room.price ?? room.base_price
      setBasePrice(p !== undefined && p !== null ? String(p) : '')

      // Images
      let loadedImgs = []
      if (Array.isArray(room.images) && room.images.length > 0) {
        loadedImgs = room.images
      } else if (typeof room.images === 'string') {
        try {
          loadedImgs = JSON.parse(room.images)
        } catch {
          loadedImgs = []
        }
      } else if (room.imageUrl || room.image) {
        loadedImgs = [room.imageUrl || room.image]
      }
      setImages(loadedImgs)

      // Devices population
      if (Array.isArray(room.devices) && room.devices.length > 0) {
        setRoomDevices(
          room.devices.map((d) => ({
            id: d.id,
            name: d.name || d.type,
            type: d.type || 'other',
            externalId: d.externalId || '',
            isActive: d.isActive !== false && d.is_active !== false,
            online: d.online !== false,
          }))
        )
      } else {
        // Fallback: fetch room devices if not embedded
        roomsService
          .getRoomDevices(room.id)
          .then((devs) => {
            if (Array.isArray(devs) && devs.length > 0) {
              setRoomDevices(
                devs.map((d) => ({
                  id: d.id,
                  name: d.name || d.type,
                  type: d.type || 'other',
                  externalId: d.externalId || '',
                  isActive: d.isActive !== false && d.is_active !== false,
                  online: d.online !== false,
                }))
              )
            } else {
              setRoomDevices(DEVICE_PRESETS.Deluxe)
            }
          })
          .catch(() => {
            setRoomDevices(DEVICE_PRESETS.Deluxe)
          })
      }
    } else {
      // Default creation values
      setNumber('')
      setFloor('1')
      setRoomType('Deluxe Suite')
      setIsCustomType(false)
      setCustomRoomType('')
      setIsActive(true)
      setDnd(false)
      setBasePrice(String(DEFAULT_PRICES['Deluxe Suite'] || 280))
      setImages([])
      setRoomDevices(DEVICE_PRESETS.Deluxe)
    }
    setImageUrlInput('')
    setIsAddingDevice(false)
    setNewDeviceName('')
    setNewDeviceType('light')
    setError(null)
  }, [room, isOpen])

  if (!isOpen) return null

  const handleTypeSelect = (val) => {
    if (val === 'Custom') {
      setIsCustomType(true)
      setRoomType('Custom')
    } else {
      setIsCustomType(false)
      setRoomType(val)
      // If basePrice is currently empty or matches a known default, update with tier suggestion
      if (!basePrice || Object.values(DEFAULT_PRICES).map(String).includes(basePrice)) {
        if (DEFAULT_PRICES[val]) {
          setBasePrice(String(DEFAULT_PRICES[val]))
        }
      }
    }
  }

  // Device management helpers
  const handleToggleDeviceActive = (index) => {
    setRoomDevices((prev) =>
      prev.map((dev, i) => (i === index ? { ...dev, isActive: !dev.isActive } : dev))
    )
  }

  const handleRemoveDevice = (index) => {
    setRoomDevices((prev) => prev.filter((_, i) => i !== index))
  }

  const handleApplyPreset = (presetKey) => {
    const preset = DEVICE_PRESETS[presetKey]
    if (preset) {
      setRoomDevices(preset.map((d) => ({ ...d })))
    }
  }

  const handleAddCustomDevice = (e) => {
    e.preventDefault()
    const trimmed = newDeviceName.trim()
    if (!trimmed) {
      setError('Please provide a name for the hardware device')
      return
    }
    setError(null)
    setRoomDevices((prev) => [
      ...prev,
      {
        name: trimmed,
        type: newDeviceType,
        isActive: true,
      },
    ])
    setNewDeviceName('')
    setIsAddingDevice(false)
  }

  // Handle local file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP)')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        setUploading(true)
        setError(null)
        const dataUrl = reader.result

        // Upload to server uploads directory
        const res = await roomsService.uploadPhoto(dataUrl)
        const backendUrl = res?.url
          ? res.url.startsWith('http')
            ? res.url
            : `http://localhost:5000${res.url}`
          : dataUrl

        setImages((prev) => [...prev, backendUrl])
      } catch (err) {
        console.warn('Server upload fallback to data URL:', err.message)
        // Graceful fallback to data URL
        setImages((prev) => [...prev, reader.result])
      } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  // Add custom URL
  const handleAddImageUrl = (e) => {
    e.preventDefault()
    const trimmed = imageUrlInput.trim()
    if (!trimmed) return
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('/')
    ) {
      setError('Image URL must start with http:// or https://')
      return
    }
    setError(null)
    setImages((prev) => [...prev, trimmed])
    setImageUrlInput('')
  }

  // Add Preset
  const handleAddPreset = (presetUrl) => {
    if (!images.includes(presetUrl)) {
      setImages((prev) => [...prev, presetUrl])
    }
  }

  // Set primary cover photo
  const handleSetCover = (index) => {
    if (index === 0) return
    setImages((prev) => {
      const copy = [...prev]
      const [picked] = copy.splice(index, 1)
      return [picked, ...copy]
    })
  }

  // Remove photo
  const handleRemovePhoto = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedNumber = number.trim()
    if (!trimmedNumber) {
      setError('Room number is required')
      return
    }

    const floorNum = parseInt(floor, 10)
    if (isNaN(floorNum)) {
      setError('Floor must be a valid number')
      return
    }

    let parsedPrice = undefined
    if (basePrice !== '' && basePrice !== null) {
      parsedPrice = parseFloat(basePrice)
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setError('Nightly price must be a valid positive number')
        return
      }
    }

    const resolvedType = isCustomType ? customRoomType.trim() : roomType

    const payload = {
      number: trimmedNumber,
      floor: floorNum,
      roomType: resolvedType || undefined,
      basePrice: parsedPrice !== undefined ? parsedPrice : null,
      isActive,
      imageUrl: images[0] || null,
      images,
      devices: roomDevices,
    }

    if (isEdit) {
      payload.dnd = dnd
    }

    try {
      setLoading(true)
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save room details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-[0_20px_50px_rgba(11,31,58,0.25)] border border-[#E5E7EB] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <BedDouble className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-white">
                {isEdit ? `Edit Suite ${room.number}` : 'Add New Suite'}
              </h2>
              <p className="text-xs text-white/70">
                {isEdit
                  ? 'Update unit specifications, pricing, hardware devices, and photos'
                  : 'Register a luxury unit with nightly rates and smart devices into inventory'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Suite Number & Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1.5">
                Suite / Room Number *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 301, 402B, Villa 1"
                className="hotel-input w-full text-sm font-semibold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1.5">
                Floor Level *
              </label>
              <input
                type="number"
                required
                min="-5"
                max="300"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 1, 2, 3"
                className="hotel-input w-full text-sm font-semibold"
              />
            </div>
          </div>

          {/* Row 2: Room Type & Nightly Price ($ USD) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1.5">
                Room Type / Suite Tier
              </label>
              <select
                value={isCustomType ? 'Custom' : roomType}
                onChange={(e) => handleTypeSelect(e.target.value)}
                className="hotel-input w-full text-sm font-medium mb-2 cursor-pointer"
              >
                {STANDARD_ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Custom">+ Custom Room Type...</option>
              </select>

              {isCustomType && (
                <input
                  type="text"
                  value={customRoomType}
                  onChange={(e) => setCustomRoomType(e.target.value)}
                  placeholder="Enter custom suite type name..."
                  className="hotel-input w-full text-sm font-medium animate-fade-in"
                />
              )}
            </div>

            {/* Nightly Base Price */}
            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Nightly Price ($ USD) *</span>
                {DEFAULT_PRICES[roomType] && !isCustomType && (
                  <span className="text-[10px] text-[#C9A227] font-semibold lowercase">
                    (rec. ${DEFAULT_PRICES[roomType]}/night)
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                  <DollarSign className="w-4 h-4 text-[#C9A227]" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder={DEFAULT_PRICES[roomType] ? String(DEFAULT_PRICES[roomType]) : '250.00'}
                  className="hotel-input w-full text-sm font-bold pl-8 text-[#0B1F3A]"
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1">
                Base nightly rate charged during mobile guest booking & PMS reservation.
              </p>
            </div>
          </div>

          {/* CONNECTED HARDWARE DEVICES MANAGEMENT */}
          <div className="p-4 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Connected Hardware Devices ({roomDevices.length})</span>
                </label>
                <p className="text-[11px] text-[#64748B]">
                  Configure IoT devices linked to this specific room (smart locks, HVAC, lighting, TVs, sensors).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingDevice(!isAddingDevice)}
                className="px-2.5 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#16335C] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#C9A227]" />
                <span>{isAddingDevice ? 'Close' : 'Add Device'}</span>
              </button>
            </div>

            {/* Quick Hardware Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#7587A7] uppercase tracking-wider mr-1">
                Presets:
              </span>
              {Object.keys(DEVICE_PRESETS).map((presetKey) => (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handleApplyPreset(presetKey)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white hover:bg-[#F4F4F2] border border-[#E5E7EB] text-[#0B1F3A] transition-colors cursor-pointer"
                  title={`Apply ${presetKey} bundle (${DEVICE_PRESETS[presetKey].length} devices)`}
                >
                  {presetKey} ({DEVICE_PRESETS[presetKey].length})
                </button>
              ))}
            </div>

            {/* Inline Add Device Form */}
            {isAddingDevice && (
              <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] shadow-2xs space-y-2.5 animate-fade-in">
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Add New Device to this Suite
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <select
                      value={newDeviceType}
                      onChange={(e) => setNewDeviceType(e.target.value)}
                      className="hotel-input w-full text-xs font-semibold py-1.5 cursor-pointer"
                    >
                      {DEVICE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      placeholder="e.g. Master Suite Lock, Soundbar, Balcony Lights"
                      className="hotel-input w-full text-xs py-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddCustomDevice}
                      className="w-full h-8 rounded-lg bg-[#C9A227] hover:bg-[#B58F1F] text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Connected Devices List */}
            {roomDevices.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {roomDevices.map((dev, idx) => {
                  const IconComponent = getDeviceIcon(dev.type)
                  const isInstalled = dev.isActive !== false

                  return (
                    <div
                      key={`${dev.id || dev.name}-${idx}`}
                      className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-between text-xs transition-all hover:border-[#CBD5E1]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                          <IconComponent className="w-3.5 h-3.5 text-[#0B1F3A]" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-[#0B1F3A] block truncate">
                            {dev.name}
                          </span>
                          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
                            Type: {dev.type}
                            {dev.externalId ? ` • ID: ${dev.externalId}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Active toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceActive(idx)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            isInstalled
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-gray-100 text-gray-500 line-through'
                          }`}
                          title={isInstalled ? 'Device enabled for room' : 'Device disabled'}
                        >
                          {isInstalled ? 'Enabled' : 'Disabled'}
                        </button>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDevice(idx)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove device from this room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] bg-white/60 text-center text-xs text-[#64748B]">
                No hardware devices attached to this room yet. Select a preset above or click "+ Add Device".
              </div>
            )}
          </div>

          {/* ROOM PICTURES & PHOTO GALLERY */}
          <div className="p-4 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Suite Pictures & Gallery ({images.length})</span>
                </label>
                <p className="text-[11px] text-[#64748B]">
                  Upload room pictures or select luxury presets. The first image will be used as the primary cover photo.
                </p>
              </div>

              {/* Upload from Device Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#16335C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Paste Image URL Input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="hotel-input grow text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F4F4F2] text-xs font-bold text-[#0B1F3A] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Add URL</span>
              </button>
            </div>

            {/* Current Photos Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] bg-white aspect-4/3 shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Suite photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80'
                      }}
                    />

                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0B1F3A] text-[#C9A227] text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#C9A227]" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-[#0B1F3A] text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center text-center bg-white/50">
                <ImageIcon className="w-8 h-8 text-[#94A3B8] mb-1.5" />
                <p className="text-xs font-semibold text-[#0B1F3A]">No room photos attached</p>
                <p className="text-[11px] text-[#64748B]">
                  Click "Upload Photo", paste an image link, or pick from luxury presets below
                </p>
              </div>
            )}

            {/* Quick Luxury Presets Picker */}
            <div>
              <span className="text-[10px] font-bold text-[#7587A7] uppercase tracking-wider block mb-1.5">
                Quick Luxury Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LUXURY_PRESETS.map((preset) => {
                  const isAdded = images.includes(preset.url)
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPreset(preset.url)}
                      disabled={isAdded}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                        isAdded
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D] opacity-60'
                          : 'bg-white border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#0B1F3A]'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3 h-3 text-[#16A34A]" />
                      ) : (
                        <Plus className="w-3 h-3 text-[#C9A227]" />
                      )}
                      <span>{preset.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Toggles: Active Status & DND */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB]">
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Active in Inventory
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Unit is operational, visible on board, and ready for guests
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isActive ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isEdit && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB]">
                <div>
                  <span className="text-xs font-bold text-[#0B1F3A] block">
                    Do Not Disturb (DND)
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Overrides staff notifications & housekeeping visits
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDnd(!dnd)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    dnd ? 'bg-[#7E22CE]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      dnd ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#16335C] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Suite...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>{isEdit ? 'Save Changes' : 'Create Suite'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
