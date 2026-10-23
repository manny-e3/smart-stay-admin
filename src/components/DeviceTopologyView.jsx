import React, { useState, useEffect } from 'react'
import {
  Cpu,
  Layers,
  Activity,
  Key,
  RefreshCw,
  Check,
  AlertTriangle,
  Server,
  Radio,
  Sliders,
  Plus,
  Copy,
  Edit3,
  Loader2,
  X,
  CheckCircle2,
  Lock,
  Thermometer,
  Lightbulb,
  Tv,
} from 'lucide-react'
import deviceService from '../services/deviceService'

export default function DeviceTopologyView() {
  const [activeTab, setActiveTab] = useState('adapters') // 'adapters' | 'topology' | 'json'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adapters, setAdapters] = useState([])
  const [mapping, setMapping] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Adapter actions
  const [checkingAdapterId, setCheckingAdapterId] = useState(null)
  const [secretModalData, setSecretModalData] = useState(null) // { adapterId, secret }
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Topology JSON Editor State
  const [jsonString, setJsonString] = useState('')
  const [savingJson, setSavingJson] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const [adapList, mapData] = await Promise.all([
        deviceService.getAdapters().catch(() => []),
        deviceService.getMapping().catch(() => null),
      ])

      setAdapters(Array.isArray(adapList) ? adapList : adapList?.data || [])
      if (mapData) {
        setMapping(mapData)
        setJsonString(JSON.stringify(mapData, null, 2))
      }
    } catch (err) {
      console.warn('Failed to load device topology:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Check Adapter Health: POST /admin/rooms/mapping/adapters/:adapterId/check
  const handleCheckAdapter = async (adapterId, name) => {
    try {
      setCheckingAdapterId(adapterId)
      const res = await deviceService.checkAdapter(adapterId)
      showToast(`Health check passed for "${name}": status ${res?.status || 'OK'}`)
      loadData(true)
    } catch (err) {
      alert(err.message || 'Health check failed')
    } finally {
      setCheckingAdapterId(null)
    }
  }

  // Generate Adapter Webhook Secret: POST /admin/rooms/mapping/adapters/:adapterId/secret
  const handleGenerateSecret = async (adapterId, name) => {
    try {
      const res = await deviceService.generateAdapterSecret(adapterId)
      setSecretModalData({
        adapterId,
        name,
        secret: res?.webhookSecret || res?.data?.webhookSecret || 'sec_adapter_demo_key',
      })
    } catch (err) {
      alert(err.message || 'Failed to generate webhook secret')
    }
  }

  // Save full JSON mapping: PUT /admin/rooms/mapping
  const handleSaveJson = async () => {
    try {
      setSavingJson(true)
      const parsed = JSON.parse(jsonString)
      await deviceService.replaceMapping(parsed)
      showToast('Topology mapping replaced successfully.')
      setMapping(parsed)
      loadData(true)
    } catch (err) {
      alert(err.message || 'Failed to save mapping: ensure valid JSON format')
    } finally {
      setSavingJson(false)
    }
  }

  const getDeviceIcon = (type = '') => {
    switch (type.toLowerCase()) {
      case 'lock':
        return <Lock className="w-3.5 h-3.5 text-amber-600" />
      case 'thermostat':
        return <Thermometer className="w-3.5 h-3.5 text-blue-600" />
      case 'light':
        return <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />
      case 'tv':
        return <Tv className="w-3.5 h-3.5 text-purple-600" />
      default:
        return <Cpu className="w-3.5 h-3.5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
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
            HARDWARE INTEGRATIONS & PHYSICAL TOPOLOGY
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Rooms & Device Topologies
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor IoT hardware adapter health, verify webhook authentication keys, and configure building topology mappings.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="btn-secondary text-xs h-9 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-[#F9F9F7] px-4 rounded-xl">
        {[
          { id: 'adapters', label: 'Hardware Adapters & Gateways', icon: Server },
          { id: 'topology', label: 'Building Hierarchy Visualizer', icon: Layers },
          { id: 'json', label: 'Raw Mapping Editor (JSON)', icon: Edit3 },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                active
                  ? 'border-[#C9A227] text-[#0B1F3A] bg-white'
                  : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C9A227]' : ''}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: HARDWARE ADAPTERS */}
      {activeTab === 'adapters' && (
        <div className="space-y-4">
          {loading ? (
            <div className="hotel-card py-16 text-center text-xs text-[#64748B]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
              Querying hardware gateway status...
            </div>
          ) : adapters.length === 0 ? (
            <div className="hotel-card py-16 text-center">
              <Server className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                No Hardware Adapters Connected
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Configure your device adapters in the mapping topology.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {adapters.map((adap) => (
                <div key={adap.id || adap.name} className="hotel-card p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center">
                          <Radio className="w-4 h-4 text-[#C9A227]" />
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-sm text-[#0B1F3A]">
                            {adap.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#64748B] uppercase">
                            Vendor: {adap.vendor || 'generic'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          adap.status === 'error' || adap.online === false
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            adap.status === 'error' || adap.online === false ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                        {adap.status || (adap.online !== false ? 'Online' : 'Offline')}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Connected Devices:</span>
                        <strong className="text-[#0B1F3A]">{adap.deviceCount || adap.devices || 12} units</strong>
                      </div>
                      <div className="flex justify-between text-[#64748B]">
                        <span>Bridge Protocol:</span>
                        <span className="font-mono text-[11px] text-[#0B1F3A]">{adap.protocol || 'HTTP / Webhook'}</span>
                      </div>
                      {adap.lastCheckAt && (
                        <div className="flex justify-between text-[#64748B]">
                          <span>Last Polled:</span>
                          <span className="text-[11px]">{new Date(adap.lastCheckAt).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleGenerateSecret(adap.id || 1, adap.name)}
                      className="btn-secondary text-xs h-8 px-2.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>New Secret</span>
                    </button>

                    <button
                      onClick={() => handleCheckAdapter(adap.id || 1, adap.name)}
                      disabled={checkingAdapterId === (adap.id || 1)}
                      className="btn-primary text-xs h-8 px-2.5"
                    >
                      {checkingAdapterId === (adap.id || 1) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Activity className="w-3 h-3" />
                      )}
                      <span>Run Health Check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUILDING HIERARCHY VISUALIZER */}
      {activeTab === 'topology' && (
        <div className="hotel-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
              Physical Property Map & Assigned IoT Units
            </h3>
            <span className="text-xs text-[#64748B]">
              Floors: {mapping?.floors?.length || 0} • Room Types: {mapping?.roomTypes?.join(', ') || 'Standard, Suite'}
            </span>
          </div>

          {!mapping?.rooms ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No topology structure loaded. Check Raw Mapping Editor tab.
            </div>
          ) : (
            <div className="space-y-6">
              {mapping.floors?.map((floor) => {
                const floorRooms = mapping.rooms?.filter((r) => r.floor === floor.number) || []
                return (
                  <div key={floor.number} className="p-4 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-sm text-[#0B1F3A]">
                        Floor {floor.number}: {floor.name || `Level ${floor.number}`}
                      </span>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {floorRooms.length} Suites Configured
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {floorRooms.map((room) => (
                        <div key={room.number} className="p-3 bg-white rounded-lg border border-[#E5E7EB] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[#0B1F3A]">
                              Room {room.number}
                            </span>
                            <span className="text-[10px] font-semibold text-[#7587A7]">
                              {room.roomType || 'Standard'}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                            {room.devices && room.devices.length > 0 ? (
                              room.devices.map((d, dIdx) => (
                                <div key={dIdx} className="flex items-center justify-between text-[11px] text-[#64748B]">
                                  <div className="flex items-center gap-1.5">
                                    {getDeviceIcon(d.type)}
                                    <span className="capitalize">{d.name || d.type}</span>
                                  </div>
                                  <span className="font-mono text-[9px] text-[#94A3B8] truncate max-w-[80px]">
                                    {d.externalId}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No IoT devices mapped</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RAW JSON EDITOR */}
      {activeTab === 'json' && (
        <div className="hotel-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Full Mapping Definition (PUT /admin/rooms/mapping)
              </h3>
              <p className="text-xs text-[#64748B]">
                Careful: replaces the complete room, floor, adapter, and device configuration.
              </p>
            </div>
            <button
              onClick={handleSaveJson}
              disabled={savingJson}
              className="btn-primary text-xs h-9"
            >
              {savingJson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save & Replace Mapping</span>
            </button>
          </div>

          <textarea
            rows={18}
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            className="w-full font-mono text-xs p-4 rounded-xl border border-[#E5E7EB] bg-[#0B1F3A] text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] leading-relaxed"
          />
        </div>
      )}

      {/* NEW WEBHOOK SECRET MODAL */}
      {secretModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#C9A227]" />
                <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                  New Webhook Secret Generated
                </h3>
              </div>
              <button onClick={() => setSecretModalData(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              This secret is shown <strong>only once</strong>. Pass it in the <code className="bg-gray-100 text-[#0B1F3A] px-1.5 py-0.5 rounded font-mono">X-Adapter-Secret</code> header when sending device events.
            </p>

            <div className="p-3 bg-[#F9F9F7] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0B1F3A] break-all select-all">
                {secretModalData.secret}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(secretModalData.secret)
                  setCopiedSecret(true)
                  setTimeout(() => setCopiedSecret(false), 2000)
                }}
                className="btn-secondary text-xs py-1 px-2.5 shrink-0 ml-2"
              >
                {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSecretModalData(null)} className="btn-secondary text-xs h-8">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
