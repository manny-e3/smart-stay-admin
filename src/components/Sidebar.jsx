import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LayoutGrid,
  BedDouble,
  Compass,
  CheckSquare,
  Users,
  Star,
  Bell,
  Calendar,
  Zap,
  Cpu,
  Server,
  ShieldCheck,
  Settings,
  History,
  LogOut,
  X,
  Sparkles,
  Utensils,
  Package,
  Truck,
  Receipt,
  Bot,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export default function Sidebar({ mobileOpen, setMobileOpen, onOpenAiCopilot }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { staff, logout } = useAuth()

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
        { id: 'rooms', label: 'Rooms Board', icon: BedDouble, path: '/rooms' },
        { id: 'front-desk', label: 'Front Desk', icon: Compass, path: '/front-desk' },
        { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, path: '/housekeeping' },
        { id: 'requests', label: 'Service Requests', icon: CheckSquare, path: '/requests' },
        { id: 'alerts', label: 'Maintenance Alerts', icon: Bell, path: '/alerts' },
        { id: 'pos', label: 'POS Terminal', icon: Utensils, path: '/pos' },
      ],
    },
    {
      title: 'INVENTORY & FINANCE',
      items: [
        { id: 'inventory', label: 'Stock & Minibar', icon: Package, path: '/inventory' },
        { id: 'procurement', label: 'Procurement POs', icon: Truck, path: '/procurement' },
        { id: 'finance', label: 'Folio Billing', icon: Receipt, path: '/finance' },
      ],
    },
    {
      title: 'GUEST RELATIONS',
      items: [
        { id: 'guests', label: 'Guests CRM', icon: Users, path: '/guests' },
        { id: 'feedback', label: 'Guest Feedback', icon: Star, path: '/feedback' },
      ],
    },
    {
      title: 'AUTOMATION & TELEMETRY',
      items: [
        { id: 'energy', label: 'Energy Analytics', icon: Zap, path: '/energy' },
        { id: 'schedules', label: 'Eco Schedules', icon: Calendar, path: '/schedules' },
        { id: 'devices', label: 'Device Topology', icon: Cpu, path: '/devices' },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'pms', label: 'PMS Sync', icon: Server, path: '/pms' },
        { id: 'staff', label: 'Staff Accounts', icon: ShieldCheck, path: '/staff' },
        { id: 'settings', label: 'Hotel Settings', icon: Settings, path: '/settings' },
        { id: 'audit', label: 'Audit Trail', icon: History, path: '/audit' },
      ],
    },
  ]

  // Check if a path is active
  const isPathActive = (item) => {
    if (item.id === 'rooms') {
      return location.pathname.startsWith('/rooms')
    }
    return location.pathname === item.path
  }

  const handleNavClick = (path) => {
    navigate(path)
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1F3A] text-white justify-between py-5 px-3 select-none">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between px-2 mb-6 shrink-0">
          <div
            onClick={() => handleNavClick('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FED255] to-[#C9A227] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
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

          {/* Close button on mobile */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[#7587A7] hover:text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AI Copilot Badge Button */}
        {onOpenAiCopilot && (
          <div className="px-2 mb-4 shrink-0">
            <button
              onClick={onOpenAiCopilot}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#183153] to-[#203D66] border border-[#FED255]/30 flex items-center justify-between text-xs font-bold text-white hover:border-[#FED255] transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#FED255] group-hover:rotate-12 transition-transform" />
                <span>AI Staff Copilot</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </button>
          </div>
        )}

        {/* Navigation Sections with Scroll */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1 min-h-0 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.18em] text-[#7587A7] uppercase px-3 block mb-1.5">
                {section.title}
              </span>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isPathActive(item)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#183153] text-white shadow-xs'
                          : 'text-[#8EA2C6] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          active ? 'text-[#FED255]' : 'text-[#7587A7]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Log out button */}
      <div className="pt-4 border-t border-white/10 px-2 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs font-medium text-[#7587A7] hover:text-white transition-colors cursor-pointer p-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="w-[235px] shrink-0 hidden md:flex flex-col h-screen sticky top-0 border-r border-white/5 overflow-hidden">
        {sidebarContent}
      </aside>
    </>
  )
}
