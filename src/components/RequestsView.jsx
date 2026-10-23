import React, { useState, useEffect } from 'react'
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Plus,
  Search,
  User,
  X,
  Loader2,
  RefreshCw,
  ChevronRight,
  MessageSquare,
  Flame,
  ArrowUpRight,
  Ban,
  Check,
  Building,
} from 'lucide-react'
import requestsService from '../services/requestsService'
import roomsService from '../services/roomsService'
import { onSocketEvent } from '../services/socket'

export default function RequestsView() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [assignees, setAssignees] = useState([])
  const [rooms, setRooms] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  // Filters
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'my' | 'escalated' | 'done' | 'all'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Action state (Cancel note, Add note)
  const [noteModalData, setNoteModalData] = useState(null) // { id, action: 'note' | 'cancel' | 'start' }
  const [actionNoteText, setActionNoteText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Create Request Form
  const [newRoomId, setNewRoomId] = useState('')
  const [newCategory, setNewCategory] = useState('housekeeping')
  const [newPriority, setNewPriority] = useState('normal')
  const [newDescription, setNewDescription] = useState('')
  const [creatingRequest, setCreatingRequest] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch requests based on active tab and filters
  const loadRequests = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const params = { limit: 50 }

      if (activeTab === 'active') {
        params.status = 'new,assigned,in_progress'
      } else if (activeTab === 'my') {
        params.assignedTo = 'me'
      } else if (activeTab === 'escalated') {
        params.escalated = 'true'
      } else if (activeTab === 'done') {
        params.status = 'done,cancelled'
      }

      if (categoryFilter !== 'all') {
        params.category = categoryFilter
      }
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter
      }

      const [res, staffList, boardData] = await Promise.all([
        requestsService.listRequests(params).catch(() => ({ items: [] })),
        requestsService.getAssignees().catch(() => []),
        roomsService.getRoomBoard().catch(() => ({ floors: [] })),
      ])

      setRequests(res?.items || [])
      setAssignees(Array.isArray(staffList) ? staffList : [])

      const flatRooms = []
      if (boardData?.floors) {
        boardData.floors.forEach((f) => {
          if (f.rooms) f.rooms.forEach((r) => flatRooms.push(r))
        })
      }
      setRooms(flatRooms)
    } catch (err) {
      console.warn('Requests load error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [activeTab, categoryFilter, priorityFilter])

  // Real-time updates via Socket.IO
  useEffect(() => {
    const unsubCreated = onSocketEvent('request:created', (newReq) => {
      showToast(`New Guest Request: Room ${newReq.room?.number || 'Guest'} (${newReq.category})`)
      loadRequests(true)
    })
    const unsubUpdated = onSocketEvent('request:updated', () => {
      loadRequests(true)
    })

    return () => {
      unsubCreated()
      unsubUpdated()
    }
  }, [])

  // Create request handler
  const handleCreateRequest = async (e) => {
    e.preventDefault()
    if (!newRoomId) {
      alert('Please select a room.')
      return
    }
    if (!newDescription.trim()) {
      alert('Please enter a description for the request.')
      return
    }
    try {
      setCreatingRequest(true)
      await requestsService.createRequest({
        roomId: Number(newRoomId),
        category: newCategory,
        priority: newPriority,
        description: newDescription.trim(),
      })
      showToast('Service ticket dispatched successfully.')
      setIsCreateModalOpen(false)
      setNewDescription('')
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to dispatch request')
    } finally {
      setCreatingRequest(false)
    }
  }

  // Assign request handler
  const handleAssign = async (reqId, staffId) => {
    try {
      await requestsService.assignRequest(reqId, staffId ? Number(staffId) : null)
      showToast(staffId ? 'Request assigned to staff member.' : 'Request unassigned.')
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to assign request')
    }
  }

  // Start request
  const handleStartRequest = async (reqId) => {
    try {
      await requestsService.startRequest(reqId, 'Attendant on the way')
      showToast('Ticket updated to In Progress.')
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to start request')
    }
  }

  // Complete request
  const handleCompleteRequest = async (reqId) => {
    try {
      await requestsService.completeRequest(reqId)
      showToast('Service request marked as completed!')
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to complete request')
    }
  }

  // Priority change
  const handleChangePriority = async (reqId, newPrio) => {
    try {
      await requestsService.setPriority(reqId, newPrio)
      showToast(`Priority updated to ${newPrio.toUpperCase()}`)
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Failed to change priority')
    }
  }

  // Submit Note / Cancel / Start with custom note
  const handleSubmitActionNote = async (e) => {
    e.preventDefault()
    if (!noteModalData) return
    try {
      setActionLoading(true)
      if (noteModalData.action === 'cancel') {
        await requestsService.cancelRequest(noteModalData.id, actionNoteText.trim() || 'Cancelled by staff')
        showToast('Request cancelled.')
      } else if (noteModalData.action === 'note') {
        await requestsService.addNote(noteModalData.id, actionNoteText.trim())
        showToast('Internal note appended to ticket.')
      }
      setNoteModalData(null)
      setActionNoteText('')
      loadRequests(true)
    } catch (err) {
      alert(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // View request detail
  const handleOpenDetail = async (reqId) => {
    try {
      setDetailLoading(true)
      const data = await requestsService.getRequestDetail(reqId)
      setSelectedRequestDetail(data)
    } catch (err) {
      alert(err.message || 'Failed to load request history')
    } finally {
      setDetailLoading(false)
    }
  }

  // Search query filter
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      String(r.room?.number || '').toLowerCase().includes(q) ||
      String(r.description || '').toLowerCase().includes(q) ||
      String(r.guest?.name || r.guest?.firstName || '').toLowerCase().includes(q) ||
      String(r.category || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-xl border border-white/10 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            GUEST SERVICES & TASK DISPATCH
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Service Requests & Ticketing
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor, assign, and resolve guest requests across housekeeping, amenities, food, and maintenance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRequests(true)}
            disabled={refreshing}
            className="btn-secondary text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="hotel-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'active', label: 'Active Queue' },
              { id: 'my', label: 'My Assigned' },
              { id: 'escalated', label: 'Escalated' },
              { id: 'done', label: 'Completed / Cancelled' },
              { id: 'all', label: 'All Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room, guest, category..."
              className="hotel-input text-xs h-8 pl-8"
            />
          </div>
        </div>

        {/* Category & Priority Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Categories</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="amenities">Amenities</option>
              <option value="maintenance">Maintenance</option>
              <option value="food">Food & Beverage</option>
              <option value="laundry">Laundry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-[#64748B] font-medium">
            Showing <strong className="text-[#0B1F3A]">{filteredRequests.length}</strong> service tickets
          </div>
        </div>
      </div>

      {/* Requests Grid / List */}
      {loading ? (
        <div className="hotel-card py-16 text-center text-xs text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
          Loading guest service tickets...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="hotel-card py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
            No Pending Service Tickets
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            All guest requests for this filter criteria have been fulfilled or resolved.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isUrgent = req.priority === 'urgent'
            const isHigh = req.priority === 'high'
            const isDone = req.status === 'done'
            const isCancelled = req.status === 'cancelled'
            const isInProgress = req.status === 'in_progress'

            return (
              <div
                key={req.id}
                className={`hotel-card p-5 border-l-4 flex flex-col justify-between transition-all hover:shadow-md ${
                  isUrgent
                    ? 'border-l-red-600'
                    : isHigh
                    ? 'border-l-amber-500'
                    : isInProgress
                    ? 'border-l-blue-600'
                    : isDone
                    ? 'border-l-emerald-600 opacity-80'
                    : 'border-l-[#0B1F3A]'
                }`}
              >
                <div>
                  {/* Card Top: Room & Priority */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9] mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-base text-[#0B1F3A]">
                          Room {req.room?.number || req.roomId || '101'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#0B1F3A]/5 text-[#0B1F3A]">
                          {req.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        Guest: <strong className="text-[#0B1F3A]">{req.guest?.name || req.guest?.firstName || 'Registered Resident'}</strong>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isUrgent
                            ? 'bg-red-100 text-red-700 font-extrabold'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {req.priority}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCancelled
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#0B1F3A] font-medium leading-relaxed mb-4">
                    "{req.description}"
                  </p>

                  {/* Assignee Selection */}
                  <div className="space-y-2 mb-4 bg-[#F9F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B] font-medium">Assigned To:</span>
                      <select
                        value={req.assignedTo || req.assignee?.id || ''}
                        onChange={(e) => handleAssign(req.id, e.target.value)}
                        disabled={isDone || isCancelled}
                        className="font-medium text-[#0B1F3A] bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {assignees.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {req.preferredAt && (
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Preferred Time:</span>
                        <span className="font-semibold text-[#0B1F3A]">
                          {new Date(req.preferredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {req.escalated && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Escalated ticket (exceeded SLA)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* View History */}
                    <button
                      onClick={() => handleOpenDetail(req.id)}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                      title="View Ticket History"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Add Operational Note */}
                    <button
                      onClick={() => {
                        setNoteModalData({ id: req.id, action: 'note' })
                        setActionNoteText('')
                      }}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                      title="Add Internal Note"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Priority Upgrade toggle */}
                    {!isDone && !isCancelled && (
                      <button
                        onClick={() => handleChangePriority(req.id, isUrgent ? 'normal' : 'urgent')}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                          isUrgent ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Toggle Urgent Priority"
                      >
                        {isUrgent ? 'Urgent' : 'Set Urgent'}
                      </button>
                    )}
                  </div>

                  {/* Workflow Status Progression */}
                  <div className="flex items-center gap-1.5">
                    {req.status === 'new' && (
                      <button
                        onClick={() => handleStartRequest(req.id)}
                        className="btn-secondary text-xs py-1 px-2.5 h-7"
                      >
                        Start
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleCompleteRequest(req.id)}
                        className="btn-primary text-xs py-1 px-2.5 h-7 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    )}

                    {!isDone && !isCancelled && (
                      <button
                        onClick={() => {
                          setNoteModalData({ id: req.id, action: 'cancel' })
                          setActionNoteText('')
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Cancel Request"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE REQUEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#0B1F3A] text-white">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-headline font-bold text-base text-white">
                  Create Guest Service Ticket
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Target Suite / Room *
                </label>
                <select
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  required
                  className="hotel-input text-xs h-9"
                >
                  <option value="">Select suite...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} ({r.roomType || 'Standard'}) - Floor {r.floor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="hotel-input text-xs h-9"
                  >
                    <option value="housekeeping">Housekeeping</option>
                    <option value="amenities">Amenities</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="food">Food & Beverage</option>
                    <option value="laundry">Laundry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                    Priority *
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="hotel-input text-xs h-9"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Request Description *
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  placeholder="e.g. Extra goose-down pillows and chilled bottled water"
                  className="hotel-input text-xs py-2"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary text-xs h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRequest}
                  className="btn-primary text-xs h-9"
                >
                  {creatingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Dispatch Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTE / CANCEL ACTION MODAL */}
      {noteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                {noteModalData.action === 'cancel' ? 'Cancel Service Request' : 'Add Internal Progress Note'}
              </h3>
              <button onClick={() => setNoteModalData(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitActionNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  {noteModalData.action === 'cancel' ? 'Cancellation Reason' : 'Note Details'}
                </label>
                <textarea
                  rows={3}
                  value={actionNoteText}
                  onChange={(e) => setActionNoteText(e.target.value)}
                  required
                  placeholder={noteModalData.action === 'cancel' ? 'e.g. Guest declined or service already provided' : 'e.g. Linen delivered to door, waiting on inspection'}
                  className="hotel-input text-xs py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalData(null)}
                  className="btn-secondary text-xs h-8"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`btn-primary text-xs h-8 ${
                    noteModalData.action === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST DETAIL & TIMELINE DRAWER */}
      {selectedRequestDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E7EB] flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#7587A7] uppercase block">
                  TICKET #{selectedRequestDetail.id}
                </span>
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                  Room {selectedRequestDetail.room?.number || selectedRequestDetail.roomId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequestDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-xs font-bold text-[#64748B] block mb-1">Description</span>
                <p className="text-xs text-[#0B1F3A] bg-[#F9F9F7] p-3 rounded-xl border border-[#E5E7EB]">
                  {selectedRequestDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Status</span>
                  <span className="font-bold text-[#0B1F3A] uppercase">{selectedRequestDetail.status}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[#64748B] block mb-0.5">Priority</span>
                  <span className="font-bold text-[#0B1F3A] uppercase">{selectedRequestDetail.priority}</span>
                </div>
              </div>

              {/* History events */}
              {selectedRequestDetail.history && selectedRequestDetail.history.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#0B1F3A] block mb-2">Audit History</span>
                  <div className="space-y-2">
                    {selectedRequestDetail.history.map((h, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>{h.action || 'Updated'}</span>
                          <span>{new Date(h.createdAt || Date.now()).toLocaleTimeString()}</span>
                        </div>
                        {h.note && <div className="text-[11px] text-gray-700">{h.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedRequestDetail(null)}
                className="w-full btn-secondary text-xs h-9 justify-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
