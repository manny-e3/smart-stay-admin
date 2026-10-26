import React, { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardContent from './components/DashboardContent'
import RoomsGridScreen from './components/RoomsGridScreen'
import RoomDetailPage from './components/RoomDetailPage'
import SchedulesView from './components/SchedulesView'
import EnergyAnalyticsView from './components/EnergyAnalyticsView'
import MaintenanceAlertsView from './components/MaintenanceAlertsView'
import FrontDeskView from './components/FrontDeskView'
import GuestsView from './components/GuestsView'
import PmsSyncView from './components/PmsSyncView'
import RequestsView from './components/RequestsView'
import StaffAccountsView from './components/StaffAccountsView'
import HotelSettingsView from './components/HotelSettingsView'
import AuditLogView from './components/AuditLogView'
import FeedbackView from './components/FeedbackView'
import DeviceTopologyView from './components/DeviceTopologyView'
import HousekeepingView from './components/HousekeepingView'
import PosTerminalView from './components/PosTerminalView'
import InventoryManagementView from './components/InventoryManagementView'
import ProcurementView from './components/ProcurementView'
import FolioBillingView from './components/FolioBillingView'
import AiStaffCopilotModal from './components/AiStaffCopilotModal'
import ReservationModal from './components/ReservationModal'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import roomsService from './services/roomsService'
import requestsService from './services/requestsService'
import { onSocketEvent } from './services/socket'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  // Mobile navigation drawer state
  const [mobileOpen, setMobileOpen] = useState(false)

  // Live rooms board state fetched from real backend
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)

  // Modals
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false)
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Remember last visited route in localStorage so refresh stays on page if authenticated
  useEffect(() => {
    if (
      location.pathname &&
      location.pathname !== '/login' &&
      location.pathname !== '/'
    ) {
      localStorage.setItem('smartstay_last_route', location.pathname)
    }
  }, [location.pathname])

  const savedRoute = localStorage.getItem('smartstay_last_route') || '/rooms'

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Fetch real rooms board from backend
  const fetchRooms = async () => {
    if (!isAuthenticated) return
    try {
      setLoadingRooms(true)
      const data = await roomsService.getRoomBoard()
      if (data?.floors && Array.isArray(data.floors)) {
        const flat = []
        data.floors.forEach((f) => {
          if (f.rooms) {
            f.rooms.forEach((r) =>
              flat.push({ ...r, floorNumber: f.number, floorName: f.name })
            )
          }
        })
        setRooms(flat)
      }
    } catch (err) {
      console.warn('Backend room board fetch error:', err.message)
    } finally {
      setLoadingRooms(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms()
    }
  }, [isAuthenticated])

  // Real-time room update listener
  useEffect(() => {
    const unsubRoom = onSocketEvent('board:room', (roomSummary) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomSummary.id ? { ...r, ...roomSummary } : r
        )
      )
    })

    const unsubRefresh = onSocketEvent('board:refresh', () => {
      fetchRooms()
    })

    return () => {
      unsubRoom()
      unsubRefresh()
    }
  }, [isAuthenticated])

  // Toggle smart device on room card or detail view
  const handleToggleDevice = (roomId, deviceKey) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const currentDevices =
            r.devices && typeof r.devices === 'object' && !Array.isArray(r.devices)
              ? r.devices
              : { light: true, fridge: true, ac: true, tv: false }
          const newState = !currentDevices[deviceKey]
          showToast(
            `${r.number} ${deviceKey.toUpperCase()} turned ${
              newState ? 'ON' : 'OFF'
            }`
          )
          return {
            ...r,
            devices: {
              ...currentDevices,
              [deviceKey]: newState,
            },
            energy24h: Number(
              ((r.energy24h || 12.0) + (newState ? 0.3 : -0.2)).toFixed(1)
            ),
          }
        }
        return r
      })
    )
  }

  // Handle room update from detail page
  const handleUpdateRoom = (updated) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    )
  }

  // Handle new reservation from Quick Action modal
  const handleConfirmReservation = (stay) => {
    const guestName = stay?.guest ? `${stay.guest.firstName} ${stay.guest.lastName}` : 'Guest'
    const guestEmail = stay?.guest?.email
    if (guestEmail) {
      showToast(`Reservation confirmed for ${guestName}. Mobile login details emailed to ${guestEmail}`)
    } else {
      showToast(`Reservation Confirmed & Allocated for ${guestName}`)
    }
    fetchRooms()
  }

  // Determine current active room for Header breadcrumb if on room detail
  const isRoomDetail =
    location.pathname.startsWith('/rooms/') && location.pathname !== '/rooms'
  const currentRoomId = isRoomDetail
    ? location.pathname.replace('/rooms/', '')
    : null
  const currentRoomObj = currentRoomId
    ? rooms.find(
        (r) =>
          String(r.id) === String(currentRoomId) ||
          String(r.number).toLowerCase().replace(/\s+/g, '') ===
            String(currentRoomId).toLowerCase().replace(/\s+/g, '')
      )
    : null

  // If loading session, show centered luxury brand splash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center shadow-md mb-4 animate-pulse">
          <div className="w-6 h-6 border-2 border-[#FED255] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="font-headline font-bold text-lg text-[#0B1F3A]">
          SmartStay Hospitality Core
        </div>
        <p className="text-xs text-[#64748B] mt-1">
          Authenticating secure staff session...
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#F7F7F5] antialiased text-[#1A1C1B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-[0_8px_24px_-4px_rgba(11,31,58,0.15)] border border-white/10 animate-fade-in text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Routes>
        {/* Public Login Route: If already authenticated, redirect to /rooms */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/rooms" replace />
            ) : (
              <LoginScreen onLogin={() => navigate('/rooms')} />
            )
          }
        />

        {/* All Protected Routes: Enclosed in ProtectedRoute & Unified Console Shell */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex bg-[#F7F7F5]">
                {/* Persistent Left Sidebar */}
                <Sidebar
                  mobileOpen={mobileOpen}
                  setMobileOpen={setMobileOpen}
                  onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
                />

                {/* Main Viewport Container */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
                  {/* Persistent Top Header */}
                  <Header
                    onOpenQuickAction={() => setIsQuickActionModalOpen(true)}
                    onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
                    setMobileOpen={setMobileOpen}
                    selectedRoom={currentRoomObj}
                  />

                  {/* Main Page Content Body */}
                  <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
                    <Routes>
                      {/* Root redirect to saved route or /rooms */}
                      <Route
                        path="/"
                        element={<Navigate to={savedRoute} replace />}
                      />

                      {/* Dashboard Screen */}
                      <Route
                        path="/dashboard"
                        element={
                          <DashboardContent
                            onOpenQuickAction={() =>
                              setIsQuickActionModalOpen(true)
                            }
                            onNavigateToRooms={() => navigate('/rooms')}
                          />
                        }
                      />

                      {/* Rooms Grid Screen */}
                      <Route
                        path="/rooms"
                        element={
                          <RoomsGridScreen
                            rooms={rooms}
                            onToggleDevice={handleToggleDevice}
                            onOpenQuickAction={() =>
                              setIsQuickActionModalOpen(true)
                            }
                            onRefreshRooms={fetchRooms}
                          />
                        }
                      />

                      {/* Room Detail Page with dynamic :roomId parameter */}
                      <Route
                        path="/rooms/:roomId"
                        element={
                          <RoomDetailPage
                            rooms={rooms}
                            onBack={() => navigate('/rooms')}
                            onUpdateRoom={handleUpdateRoom}
                            onToggleDevice={handleToggleDevice}
                          />
                        }
                      />

                      {/* Front Desk & Daily Stays Manifest Screen */}
                      <Route path="/front-desk" element={<FrontDeskView />} />
                      <Route path="/stays" element={<Navigate to="/front-desk" replace />} />

                      {/* Housekeeping Turnover & White-glove Inspections */}
                      <Route path="/housekeeping" element={<HousekeepingView />} />

                      {/* POS F&B & Retail Terminal */}
                      <Route path="/pos" element={<PosTerminalView />} />

                      {/* Physical Stock & Minibar Inventory */}
                      <Route path="/inventory" element={<InventoryManagementView />} />

                      {/* Procurement POs & Vendor Receiving */}
                      <Route path="/procurement" element={<ProcurementView />} />

                      {/* Folio Billing, Ledger & Checkouts */}
                      <Route path="/finance" element={<FolioBillingView />} />
                      <Route path="/folios" element={<Navigate to="/finance" replace />} />

                      {/* Guest Relations & CRM Screen */}
                      <Route path="/guests" element={<GuestsView />} />

                      {/* PMS Synchronization & Webhooks Screen */}
                      <Route path="/pms" element={<PmsSyncView />} />

                      {/* Schedules Automation Screen */}
                      <Route path="/schedules" element={<SchedulesView />} />

                      {/* Energy Analytics Screen */}
                      <Route path="/energy" element={<EnergyAnalyticsView />} />

                      {/* Maintenance Alerts Screen */}
                      <Route
                        path="/alerts"
                        element={<MaintenanceAlertsView />}
                      />

                      {/* Guest Service Requests Management */}
                      <Route path="/requests" element={<RequestsView />} />

                      {/* Guest Feedback & Ratings Dashboard */}
                      <Route path="/feedback" element={<FeedbackView />} />

                      {/* Staff Accounts Management */}
                      <Route path="/staff" element={<StaffAccountsView />} />

                      {/* Property Operations Settings */}
                      <Route path="/settings" element={<HotelSettingsView />} />

                      {/* System Audit & Activity Log */}
                      <Route path="/audit" element={<AuditLogView />} />

                      {/* Device Topology & Hardware Adapters */}
                      <Route path="/devices" element={<DeviceTopologyView />} />

                      {/* Catch-all fallback */}
                      <Route
                        path="*"
                        element={<Navigate to="/rooms" replace />}
                      />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Quick Action Modal */}
      <ReservationModal
        isOpen={isQuickActionModalOpen}
        onClose={() => setIsQuickActionModalOpen(false)}
        onConfirm={handleConfirmReservation}
      />

      {/* Staff AI Copilot Modal */}
      <AiStaffCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
      />
    </div>
  )
}
