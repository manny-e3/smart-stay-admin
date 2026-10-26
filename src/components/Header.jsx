import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  Bell,
  Search,
  Plus,
  X,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Shield,
  Bot,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import alertsService from '../services/alertsService'
import { onSocketEvent } from '../services/socket'
import StaffProfileModal from './StaffProfileModal'

export default function Header({
  onOpenQuickAction,
  onOpenAiCopilot,
  setMobileOpen,
  selectedRoom,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { staff, logout, socketConnected } = useAuth()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const isRoomDetail = location.pathname.startsWith('/rooms/') && location.pathname !== '/rooms'
  const roomIdFromPath = isRoomDetail ? location.pathname.replace('/rooms/', '') : null

  const [liveNotifications, setLiveNotifications] = useState([])

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await alertsService.listAlerts({ status: 'open', limit: 5 })
        if (res?.items && Array.isArray(res.items)) {
          setLiveNotifications(
            res.items.map((item) => ({
              id: item.id,
              title: item.title,
              time: item.firstSeenAt
                ? new Date(item.firstSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              unread: true,
              desc: `${item.room?.number ? `Room ${item.room.number} • ` : ''}${item.message || 'Hardware incident reported'}`,
            }))
          )
        }
      } catch (e) {
        console.warn('Failed to load header notifications:', e.message)
      }
    }
    loadNotifications()

    const unsub = onSocketEvent('alert:created', (newAlert) => {
      setLiveNotifications((prev) => [
        {
          id: newAlert.id || Date.now(),
          title: newAlert.title || 'New Hardware Incident',
          time: 'Just now',
          unread: true,
          desc: newAlert.message || 'Telemetry incident ticket opened',
        },
        ...prev.slice(0, 4),
      ])
    })
    return () => unsub()
  }, [])

  const getHeaderContext = () => {
    if (location.pathname === '/schedules') {
      return {
        top: 'SmartStay Hotel • Schedules Automation (Release 2)',
        bottom: 'OCCUPANCY 94% • 26 UNITS MONITORED',
      }
    }
    if (location.pathname === '/energy') {
      return {
        top: 'SmartStay Hotel • Energy Analytics (Release 2)',
        bottom: 'OCCUPANCY 94% • 26 UNITS MONITORED',
      }
    }
    if (location.pathname === '/alerts') {
      return {
        top: 'SmartStay Hotel • Maintenance & Hardware Alerts',
        bottom: 'TELEMETRY LIVE • 26 ROOMS SCANNED',
      }
    }
    return {
      top: 'SmartStay Hotel • Staff Operations Console',
      bottom: 'OCCUPANCY 94% • LIVE HARDWARE TELEMETRY',
    }
  }

  const headerContext = getHeaderContext()

  const roleLabels = {
    admin: 'System Admin',
    manager: 'General Manager',
    service: 'Guest Service Lead',
    maintenance: 'Chief Technician',
    front_desk: 'Front Desk Host',
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left Side: Mobile Menu Button + Property Info matching Screen 2 */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-[#0B1F3A] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-xs text-[#64748B] font-medium flex items-center gap-2">
            <span>{headerContext.top}</span>
            {isRoomDetail && (
              <>
                <span className="text-[#CBD5E1]">/</span>
                <button
                  onClick={() => navigate('/rooms')}
                  className="text-xs font-semibold text-[#C9A227] hover:underline cursor-pointer"
                >
                  Rooms
                </button>
                <span className="text-[#CBD5E1]">/</span>
                <span className="font-bold text-[#0B1F3A]">
                  {selectedRoom ? selectedRoom.number : `Room ${roomIdFromPath}`}
                </span>
              </>
            )}
          </div>
          <div className="text-xs font-bold text-[#0B1F3A] tracking-wider uppercase mt-0.5">
            {headerContext.bottom}
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center relative w-72 xl:w-88">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search guest, suite, device ID (⌘K)..."
          className="hotel-input h-9 pl-9 pr-3 text-xs bg-[#F9F9F7] focus:bg-white"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B1F3A]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Side: Operational Status, Socket.IO, Notifications, Manager Avatar & Quick Action */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Socket.IO Live Status Indicator */}
        <div
          title={socketConnected ? 'Live Socket.IO Stream Active' : 'Socket.IO Disconnected'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            socketConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{socketConnected ? 'Live Sync' : 'Reconnecting'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 text-[#0B1F3A] hover:bg-[#F4F4F2] rounded-lg transition-colors cursor-pointer relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_12px_32px_-4px_rgba(11,31,58,0.15)] p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-2">
                  <span className="text-xs font-bold text-[#0B1F3A]">
                    Operational Notifications
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                    {liveNotifications.length} New
                  </span>
                </div>
                <div className="space-y-2.5">
                  {liveNotifications.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-3 text-center">
                      No active operational notifications
                    </p>
                  ) : (
                    liveNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl hover:bg-[#F9F9F7] transition-colors border border-transparent hover:border-[#E5E7EB]"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#0B1F3A]">{n.title}</span>
                          <span className="text-[10px] text-[#64748B]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Staff Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#E5E7EB] hover:opacity-85 transition-opacity cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {staff?.name ? staff.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="block text-xs font-bold text-[#0B1F3A] max-w-[130px] truncate">
                {staff?.name || 'Staff User'}
              </span>
              <span className="block text-[11px] text-[#64748B] capitalize">
                {roleLabels[staff?.role] || staff?.role || 'Admin'}
              </span>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_12px_32px_-4px_rgba(11,31,58,0.15)] p-3 z-50 animate-fade-in">
                <div className="p-2 border-b border-[#F1F5F9] mb-2">
                  <div className="text-xs font-bold text-[#0B1F3A]">{staff?.name}</div>
                  <div className="text-[11px] text-[#64748B] truncate">{staff?.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] text-[10px] font-bold uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-[#C9A227]" />
                    <span>{staff?.role}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      setIsProfileModalOpen(true)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1A1C1B] hover:bg-[#F4F4F2] flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Profile & Security (2FA)</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      navigate('/login')
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1A1C1B] hover:bg-[#F4F4F2] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Switch Staff Role</span>
                  </button>

                  <button
                    onClick={async () => {
                      setProfileOpen(false)
                      await logout()
                      navigate('/login')
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Copilot Trigger */}
        {onOpenAiCopilot && (
          <button
            onClick={onOpenAiCopilot}
            className="h-9 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#183153] text-[#FED255] border border-[#FED255]/40 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Open SmartStay Staff AI Copilot (Gemini Engine)"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>
        )}

        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="h-9 px-3.5 sm:px-4 rounded-lg bg-[#C9A227] hover:bg-[#B58F1F] active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
          id="btn-header-quick-action"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Quick Action</span>
          <span className="sm:hidden">Action</span>
        </button>
      </div>

      {/* Staff Profile & Security Modal */}
      <StaffProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        staff={staff}
      />
    </header>
  )
}
