import React, { useState } from 'react'
import {
  Home,
  LayoutGrid,
  BedDouble,
  Calendar,
  Zap,
  Bell,
  LogOut,
  SlidersHorizontal,
  Download,
  Plus,
  TrendingUp,
  Building2,
  Shield,
  AlertTriangle,
  ArrowRight,
  Thermometer,
  BatteryCharging,
  Wrench,
  RefreshCw,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react'

export default function DashboardScreen({
  onLogout,
  onOpenQuickAction,
  activeNavTab,
  setActiveNavTab,
}) {
  // Climate Toggles
  const [quietHours, setQuietHours] = useState(true)
  const [lobbyLighting, setLobbyLighting] = useState(true)

  // Maintenance Items state
  const [maintenanceItems, setMaintenanceItems] = useState([
    {
      id: 'suite-402',
      room: 'Suite 402',
      badge: 'HVAC High',
      badgeColor: 'bg-[#FEE2E2] text-[#DC2626]',
      icon: Thermometer,
      iconBg: 'bg-[#FEE2E2] text-[#DC2626]',
      title: 'Thermostat deviation +3°C above setpoint',
      meta: 'Room set to 21.0°C • Sensor measures 24.2°C • Occupied (Guest: V. Lind)',
      dispatched: false,
    },
    {
      id: 'room-118',
      room: 'Room 118',
      badge: 'Low Battery',
      badgeColor: 'bg-[#FEF3C7] text-[#B45309]',
      icon: BatteryCharging,
      iconBg: 'bg-[#FEF3C7] text-[#B45309]',
      title: 'Smart lock critical power reserve (14%)',
      meta: 'Zigbee Door Module • Vacant until tomorrow 15:00 • Est. 48 hrs left',
      dispatched: false,
    },
  ])

  const handleDispatch = (id) => {
    setMaintenanceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, dispatched: true } : item))
    )
  }

  const handleDismiss = (id) => {
    setMaintenanceItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex antialiased text-[#1A1C1B]">
      {/* Persistent Left Sidebar matching Screen 2 */}
      <aside className="w-[230px] shrink-0 bg-[#0B1F3A] text-white flex flex-col justify-between py-6 px-4 select-none">
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FED255] to-[#C9A227] flex items-center justify-center shadow-xs">
              <Home className="w-4 h-4 text-[#0B1F3A] stroke-[2.5]" />
            </div>
            <div>
              <div className="font-headline font-bold text-base tracking-wide text-white leading-tight">
                SmartStay
              </div>
              <div className="text-[9px] font-bold tracking-[0.15em] text-[#7587A7] uppercase">
                HOSPITALITY CORE
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveNavTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeNavTab === 'dashboard'
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'text-[#7587A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-[#FED255]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveNavTab('rooms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeNavTab === 'rooms'
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'text-[#7587A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>Rooms</span>
            </button>

            <button
              onClick={() => setActiveNavTab('schedules')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeNavTab === 'schedules'
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'text-[#7587A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedules</span>
            </button>

            <button
              onClick={() => setActiveNavTab('energy')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeNavTab === 'energy'
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'text-[#7587A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Energy</span>
            </button>

            <button
              onClick={() => setActiveNavTab('alerts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeNavTab === 'alerts'
                  ? 'bg-[#183153] text-white shadow-xs'
                  : 'text-[#7587A7] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </button>
          </nav>
        </div>

        {/* Log out button matching Screen 2 */}
        <div className="pt-6 border-t border-white/10 px-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 text-xs font-medium text-[#7587A7] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar matching Screen 2 */}
        <header className="bg-white/90 backdrop-blur-xs border-b border-[#E5E7EB] px-8 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B] font-medium">
              Grand View Palace • 24 Oct 2024
            </div>
            <div className="text-xs font-bold text-[#0B1F3A] tracking-wider uppercase mt-0.5">
              OCCUPANCY 94% • HIGH DEMAND
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Property Operational Status */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Property Operational</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                className="p-1.5 text-[#0B1F3A] hover:bg-[#F4F4F2] rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
              </button>
            </div>

            {/* Manager Avatar Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5E7EB]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Eleanor Vance"
                className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
              />
              <div className="leading-tight">
                <span className="block text-xs font-bold text-[#0B1F3A]">
                  Eleanor Vance
                </span>
                <span className="block text-[11px] text-[#64748B]">
                  General Manager
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* Header Title & Actions matching Screen 2 */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#B45309] tracking-wider uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>MORNING BRIEFING • SHIFT A</span>
              </div>
              <h1 className="font-headline font-bold text-3xl text-[#0B1F3A] tracking-tight">
                Good morning, Sarah
              </h1>
              <p className="text-xs text-[#64748B] mt-1">
                The Grand Azure Resort • 142 of 160 rooms active today
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter View */}
              <button className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Filter View</span>
              </button>

              {/* Export Report */}
              <button className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 shadow-xs transition-colors">
                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Export Report</span>
              </button>

              {/* + Quick Action (Imperial Gold button) */}
              <button
                onClick={onOpenQuickAction}
                className="h-9 px-4 rounded-lg bg-[#C9A227] hover:bg-[#B58F1F] active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Quick Action</span>
              </button>
            </div>
          </div>

          {/* 4 Top KPI Cards matching Screen 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Occupancy Rate */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    OCCUPANCY RATE
                  </span>
                  <div className="p-1 rounded bg-[#F4F4F2] text-[#64748B]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                    88.7%
                  </span>
                  <span className="text-xs font-bold text-[#16A34A] flex items-center gap-0.5">
                    ↑ +3.2%
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">142 / 160 Suites Occupied</p>
              </div>

              {/* Progress bar matching Screen 2 (Gold bar) */}
              <div className="mt-4 pt-2">
                <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C9A227] rounded-full" style={{ width: '88.7%' }} />
                </div>
              </div>
            </div>

            {/* Card 2: Today's Arrivals */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    TODAY'S ARRIVALS
                  </span>
                  <div className="p-1 rounded bg-[#F4F4F2] text-[#64748B]">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                    24
                  </span>
                  <span className="text-xs text-[#64748B] font-medium">Check-ins</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    18 Completed
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    6 Pending
                  </span>
                </div>
              </div>

              {/* Progress bar (Split green and gold) */}
              <div className="mt-4 pt-2 flex gap-1 h-1.5 w-full">
                <div className="h-full bg-[#16A34A] rounded-l-full" style={{ width: '75%' }} />
                <div className="h-full bg-[#F59E0B] rounded-r-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Card 3: Energy Efficiency */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    ENERGY EFFICIENCY
                  </span>
                  <div className="p-1 rounded bg-[#F4F4F2] text-[#64748B]">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
                    94.2%
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                    Optimal
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Eco-mode active in 128 rooms
                </p>
              </div>

              {/* Green Progress bar */}
              <div className="mt-4 pt-2">
                <div className="h-1.5 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '94.2%' }} />
                </div>
              </div>
            </div>

            {/* Card 4: System Diagnostics */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] mb-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    SYSTEM DIAGNOSTICS
                  </span>
                  <div className="p-1 rounded bg-[#FEE2E2] text-[#DC2626]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-3xl text-[#DC2626]">
                    2
                  </span>
                  <span className="text-xs font-semibold text-[#DC2626]">
                    Require Attention
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 truncate">
                  Suite 402 HVAC • Room 118 ...
                </p>
              </div>

              {/* Hardware mesh status */}
              <div className="mt-4 pt-2 flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>Hardware Mesh Online</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              </div>
            </div>
          </div>

          {/* Middle Row: Two Columns matching Screen 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Live Wing & Floor Status (7 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
              {/* Card Header & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                    Live Wing & Floor Status
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Real-time room allocation across building tiers
                  </p>
                </div>
                {/* Legend matching Screen 2 */}
                <div className="flex items-center gap-3 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    124 Occupied
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    18 Reserved
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                    18 Vacant Clean
                  </span>
                </div>
              </div>

              {/* 3 Mini Wing Cards in a row matching Screen 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5">
                {/* West Wing */}
                <div className="bg-[#F9F9F7] rounded-xl p-3.5 border border-[#E5E7EB]/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#0B1F3A]">West Wing</span>
                    <span className="text-[11px] text-[#64748B]">Floors 1–4</span>
                  </div>
                  <div className="font-headline font-bold text-lg text-[#0B1F3A] mb-2">
                    58 <span className="text-xs font-normal text-[#64748B]">/ 64 active</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E3E1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B1F3A] rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                {/* East Wing */}
                <div className="bg-[#F9F9F7] rounded-xl p-3.5 border border-[#E5E7EB]/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#0B1F3A]">East Wing</span>
                    <span className="text-[11px] text-[#64748B]">Floors 1–4</span>
                  </div>
                  <div className="font-headline font-bold text-lg text-[#0B1F3A] mb-2">
                    72 <span className="text-xs font-normal text-[#64748B]">/ 80 active</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E3E1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B1F3A] rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                {/* Penthouse Suites */}
                <div className="bg-[#F9F9F7] rounded-xl p-3.5 border border-[#E5E7EB]/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#0B1F3A]">Penthouse Suites</span>
                    <span className="text-[11px] text-[#64748B]">Floor 5</span>
                  </div>
                  <div className="font-headline font-bold text-lg text-[#0B1F3A] mb-2">
                    12 <span className="text-xs font-normal text-[#64748B]">/ 16 active</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E3E1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B1F3A] rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              {/* Sub-section: Live Front-Desk Flow matching Screen 2 */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-[#64748B] uppercase tracking-wider text-[11px]">
                    LIVE FRONT-DESK FLOW
                  </span>
                  <button className="text-xs font-semibold text-[#0B1F3A] hover:text-[#C9A227] flex items-center gap-1 transition-colors">
                    <span>View All Stays</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Flow List matching Screen 2 */}
                <div className="space-y-2.5">
                  {/* Row 1: Arthur & Clara Lindqvist */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] hover:bg-[#F4F4F2] border border-[#E5E7EB]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E5E7EB] text-[#0B1F3A] flex items-center justify-center font-bold text-xs shrink-0">
                        AL
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0B1F3A]">
                          Arthur & Clara Lindqvist
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Suite 408 • Deluxe King Oceanfront
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                        10:42 AM
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        Checked In
                      </span>
                    </div>
                  </div>

                  {/* Row 2: David Mercer (VIP) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] hover:bg-[#F4F4F2] border border-[#E5E7EB]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E5E7EB] text-[#0B1F3A] flex items-center justify-center font-bold text-xs shrink-0">
                        DM
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0B1F3A]">
                          David Mercer (VIP)
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Penthouse 502 • Presidential Horizon
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                        11:15 AM ETA
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#B45309]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        Luggage Arrived
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Helena Rossi-Monti */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F9F7] hover:bg-[#F4F4F2] border border-[#E5E7EB]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E5E7EB] text-[#0B1F3A] flex items-center justify-center font-bold text-xs shrink-0">
                        HM
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0B1F3A]">
                          Helena Rossi-Monti
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Room 214 • Executive Garden Suite
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                        09:50 AM
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E2E3E1] text-[#44474D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
                        Departure Finalized
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Climate & Energy (4 cols) matching Screen 2 */}
            <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)] flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                      Climate & Energy
                    </h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Automated HVAC setpoint optimization
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    Eco-Sync
                  </span>
                </div>

                {/* Circular Radial Gauge Card matching Screen 2 */}
                <div className="my-5 bg-[#F9F9F7] rounded-xl p-5 border border-[#E5E7EB]/70 flex flex-col items-center justify-center">
                  {/* Gauge SVG with gold arch */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="180 300"
                        strokeLinecap="round"
                      />
                      {/* Gold Gradient Active Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="url(#goldGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="135 300"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ECC246" />
                          <stop offset="100%" stopColor="#C9A227" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Gauge Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold tracking-wider text-[#64748B] uppercase">
                        TARGET AVG
                      </span>
                      <span className="font-headline font-bold text-2xl text-[#0B1F3A] leading-none my-0.5">
                        21.5°
                      </span>
                      <span className="text-[10px] text-[#64748B]">Celsius</span>
                    </div>
                  </div>

                  {/* Smart Eco-Balance: Active badge matching Screen 2 */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#0B1F3A] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Smart Eco-Balance: Active</span>
                  </div>
                </div>

                {/* Toggles matching Screen 2 */}
                <div className="space-y-4 pt-1">
                  {/* Toggle 1: Quiet Hours Preset */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0B1F3A]">
                        Quiet Hours Preset
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Soft airflow from 22:00 to 07:00
                      </div>
                    </div>
                    <button
                      onClick={() => setQuietHours(!quietHours)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        quietHours ? 'bg-[#0B1F3A]' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          quietHours ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Lobby Lighting Schedule */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0B1F3A]">
                        Lobby Lighting Schedule
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Natural daylight sensor sync
                      </div>
                    </div>
                    <button
                      onClick={() => setLobbyLighting(!lobbyLighting)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        lobbyLighting ? 'bg-[#0B1F3A]' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          lobbyLighting ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Metric matching Screen 2 */}
              <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Estimated Monthly Saving</span>
                <span className="font-bold text-[#0B1F3A]">14.8 kWh / room</span>
              </div>
            </div>
          </div>

          {/* Bottom Card: Priority Maintenance Attention matching Screen 2 */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]/80 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Priority Maintenance Attention
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">
                Auto-detected by IoT Core • {maintenanceItems.length} outstanding issues
              </span>
            </div>

            {/* Two Side-by-Side Cards matching Screen 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              {maintenanceItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB] flex flex-col justify-between"
                  >
                    <div>
                      {/* Icon + Suite Title + Badge */}
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-[#0B1F3A]">
                            {item.room}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Issue description */}
                      <p className="text-xs font-semibold text-[#0B1F3A] mb-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        {item.meta}
                      </p>
                    </div>

                    {/* Action buttons matching Screen 2 */}
                    <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#E5E7EB]/60">
                      {item.id === 'suite-402' ? (
                        <>
                          <button
                            onClick={() => alert(`Telemetry log for ${item.room}: Setpoint 21.0°C, Ambient 24.2°C, Compressor Cycle 98%.`)}
                            className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold text-[#0B1F3A] transition-colors"
                          >
                            View Telemetry
                          </button>
                          <button
                            onClick={() => handleDispatch(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              item.dispatched
                                ? 'bg-[#16A34A] text-white'
                                : 'bg-[#0B1F3A] text-white hover:bg-[#000615]'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>
                              {item.dispatched ? 'Maintenance Dispatched' : 'Dispatch Maintenance'}
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDismiss(item.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0B1F3A] transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleDispatch(item.id)}
                            className={`px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9F9F7] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              item.dispatched ? 'text-[#16A34A]' : 'text-[#0B1F3A]'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>
                              {item.dispatched ? 'Work Order Logged' : 'Assign Battery Swap'}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
