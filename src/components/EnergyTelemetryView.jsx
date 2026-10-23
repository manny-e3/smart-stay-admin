import React, { useState } from 'react'
import {
  Zap,
  Thermometer,
  Shield,
  Sparkles,
  Sliders,
  TrendingDown,
  RefreshCw,
  Building2,
  CheckCircle2,
} from 'lucide-react'

export default function EnergyTelemetryView({ rooms = [] }) {
  const [ecoModeAll, setEcoModeAll] = useState(true)
  const [syncStatus, setSyncStatus] = useState('Synchronized')

  const totalKwH = rooms.reduce((acc, r) => acc + (r.energy24h || 12.5), 0).toFixed(1)
  const avgTemp = (
    rooms.reduce((acc, r) => acc + (r.temp || 21.5), 0) / (rooms.length || 1)
  ).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            IOT SMART GRID & HVAC TELEMETRY
          </span>
          <h1 className="headline-xl">Climate & Energy Telemetry</h1>
          <p className="body-md text-[#64748B] mt-1">
            Real-time IoT HVAC mesh control, portfolio kilowatt-hour metrics, and dynamic setpoint balancing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSyncStatus('Rebalancing...')
              setTimeout(() => setSyncStatus('Synchronized'), 1200)
            }}
            className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{syncStatus}</span>
          </button>

          <button
            onClick={() => setEcoModeAll(!ecoModeAll)}
            className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              ecoModeAll
                ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                : 'bg-[#0B1F3A] text-white hover:bg-[#000615]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{ecoModeAll ? 'Eco-Sync: Active' : 'Enable Eco-Sync'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards in Theme Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              PORTFOLIO AVG TEMPERATURE
            </span>
            <div className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626]">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline font-bold text-3xl text-[#0B1F3A]">
              {avgTemp}°C
            </div>
            <p className="text-xs text-[#15803D] font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Within 0.4°C of target setpoint
            </p>
          </div>
          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div className="h-full bg-[#C9A227] rounded-full" style={{ width: '72%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              24-HR PORTFOLIO POWER
            </span>
            <div className="p-1.5 rounded-lg bg-[#FEF7DB] text-[#C9A227]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline font-bold text-3xl text-[#0B1F3A]">
              {totalKwH} kWh
            </div>
            <p className="text-xs text-[#15803D] font-semibold mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-18.4% vs unmanaged baseline</span>
            </p>
          </div>
          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              ZIGBEE MESH STATUS
            </span>
            <div className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#15803D]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline font-bold text-3xl text-[#15803D]">
              160 / 160
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              100% telemetry online • 0 packet loss
            </p>
          </div>
          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
              <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Wing & Subsystems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <h3 className="font-headline font-bold text-base text-[#0B1F3A] mb-1">
            Subsystem Energy Breakdown
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Real-time power consumption by appliance category
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#0B1F3A]">HVAC & Inverter Compressors</span>
                <span className="text-[#0B1F3A]">61.4% (132.8 kWh)</span>
              </div>
              <div className="h-2 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                <div className="h-full bg-[#C9A227] rounded-full" style={{ width: '61.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#0B1F3A]">Mini-Bar Wine & Food Cellars</span>
                <span className="text-[#0B1F3A]">19.2% (41.5 kWh)</span>
              </div>
              <div className="h-2 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '19.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#0B1F3A]">Architectural & Landscape Lighting</span>
                <span className="text-[#0B1F3A]">12.8% (27.7 kWh)</span>
              </div>
              <div className="h-2 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '12.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#0B1F3A]">Hospitality Entertainment Displays</span>
                <span className="text-[#0B1F3A]">6.6% (14.2 kWh)</span>
              </div>
              <div className="h-2 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '6.6%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
          <h3 className="font-headline font-bold text-base text-[#0B1F3A] mb-1">
            Active Eco-Optimization Mesh
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Automated environmental protocols currently running across the property
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Unoccupied Setback Protocol
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Vacant suites automatically adjust to 23.5°C to conserve power
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Window Balcony Sensor Interlock
                </span>
                <span className="text-[11px] text-[#64748B]">
                  HVAC immediately pauses when terrace glass door is opened
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block">
                  Circadian Daylight Harvest
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Corridor and lobby luminaires dim by 45% during peak daylight
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
