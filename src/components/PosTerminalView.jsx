import React, { useState, useEffect } from 'react'
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building,
  CheckCircle2,
  Printer,
  FileText,
  Search,
  Filter,
  DollarSign,
  Coffee,
  Wine,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  X,
} from 'lucide-react'
import posService from '../services/posService'
import roomsService from '../services/roomsService'

export default function PosTerminalView() {
  const [outlets, setOutlets] = useState([])
  const [selectedOutlet, setSelectedOutlet] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Active Order / Cart State
  const [orderItems, setOrderItems] = useState([])
  const [orderType, setOrderType] = useState('dine_in')
  const [tableOrRoom, setTableOrRoom] = useState('')
  const [selectedStayId, setSelectedStayId] = useState(null)
  const [orderNotes, setOrderNotes] = useState('')

  // Checked in rooms for room charge lookup
  const [checkedInRooms, setCheckedInRooms] = useState([])

  // Modals & Receipts
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [zReportModalOpen, setZReportModalOpen] = useState(false)
  const [zReportData, setZReportData] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load Outlets & Checked-in Rooms on mount
  useEffect(() => {
    async function init() {
      try {
        const [outletsList, roomsBoard] = await Promise.all([
          posService.getOutlets(),
          roomsService.getRoomBoard().catch(() => ({ floors: [] })),
        ])
        setOutlets(outletsList)
        if (outletsList.length > 0) {
          setSelectedOutlet(outletsList[0])
        }

        // Extract checked in rooms
        const occupied = []
        if (roomsBoard?.floors) {
          roomsBoard.floors.forEach((f) => {
            if (f.rooms) {
              f.rooms.forEach((r) => {
                if (r.status === 'occupied' || r.guest) {
                  occupied.push(r)
                }
              })
            }
          })
        }
        setCheckedInRooms(occupied)
      } catch (err) {
        console.warn('POS init error:', err)
      }
    }
    init()
  }, [])

  // Load categories and menu whenever selected outlet changes
  useEffect(() => {
    if (!selectedOutlet) return
    async function loadOutletData() {
      try {
        setLoadingMenu(true)
        const [cats, items] = await Promise.all([
          posService.getCategories(selectedOutlet.id),
          posService.getMenu(selectedOutlet.id),
        ])
        setCategories(cats)
        setSelectedCategory(null) // All
        setMenuItems(items)
      } catch (err) {
        console.warn('Load menu error:', err)
      } finally {
        setLoadingMenu(false)
      }
    }
    loadOutletData()
  }, [selectedOutlet])

  // Cart Management
  const addToCart = (item) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          sku: item.sku,
          unitPrice: Number(item.price),
          taxRate: Number(item.tax_rate || 7.5),
          quantity: 1,
          specialInstructions: '',
        },
      ]
    })
  }

  const updateQuantity = (id, delta) => {
    setOrderItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta
            return newQty > 0 ? { ...i, quantity: newQty } : null
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => {
    setOrderItems([])
    setTableOrRoom('')
    setSelectedStayId(null)
    setOrderNotes('')
  }

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  )
  const taxAmount = orderItems.reduce(
    (sum, i) => sum + (i.unitPrice * i.quantity * i.taxRate) / 100,
    0
  )
  const totalAmount = subtotal + taxAmount

  // Handle Checkout / Pay
  const handleProcessOrder = async () => {
    if (orderItems.length === 0) {
      showToast('Please add items to the order first.')
      return
    }

    try {
      setIsProcessing(true)
      const orderPayload = {
        outletId: selectedOutlet.id,
        orderType,
        tableOrRoom: tableOrRoom || 'Counter',
        stayId: selectedStayId || null,
        notes: orderNotes,
        items: orderItems,
      }

      const created = await posService.createOrder(orderPayload)

      if (paymentMethod === 'room_folio') {
        if (!selectedStayId) {
          showToast('Please select a checked-in suite to charge this order to.')
          setIsProcessing(false)
          return
        }
        await posService.chargeToRoom(created.id, selectedStayId)
        showToast(
          `Order #${created.orderNumber} successfully charged to Suite Folio!`
        )
      } else {
        await posService.payOrder(created.id, {
          paymentMethod,
          amount: created.totalAmount,
        })
        showToast(
          `Payment for Order #${created.orderNumber} processed ($${created.totalAmount.toFixed(2)})`
        )
      }

      setCompletedOrder({
        ...created,
        items: orderItems,
        outletName: selectedOutlet.name,
        paymentMethod,
        tableOrRoom: tableOrRoom || 'Counter',
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })

      clearCart()
      setPaymentModalOpen(false)
    } catch (err) {
      showToast(err.message || 'Failed to process order.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Load Daily Z-Report
  const handleOpenZReport = async () => {
    try {
      const rep = await posService.getDailyZReport()
      setZReportData(rep)
      setZReportModalOpen(true)
    } catch (err) {
      showToast('Could not load Daily Z-Report')
    }
  }

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category_id === selectedCategory.id
      : true
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-lg border border-white/10 animate-fade-in text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-[#FED255]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            F&B & RETAIL OPERATIONS
          </span>
          <h1 className="headline-xl flex items-center gap-3">
            <span>POS Billing Terminal</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
              Live Register
            </span>
          </h1>
          <p className="body-md text-[#64748B] mt-1">
            Touch-screen food, beverage, and retail register with instant room folio billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenZReport}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#C9A227]" />
            <span>Daily Z-Report</span>
          </button>
        </div>
      </div>

      {/* Outlet Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {outlets.map((outlet) => (
          <button
            key={outlet.id}
            onClick={() => setSelectedOutlet(outlet)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedOutlet?.id === outlet.id
                ? 'bg-[#0B1F3A] text-white shadow-md'
                : 'bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0B1F3A]'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#FED255]" />
            <span>{outlet.name}</span>
            <span className="text-[10px] opacity-75 font-normal">
              ({outlet.opening_hours})
            </span>
          </button>
        ))}
      </div>

      {/* Main Terminal Grid: Catalog (Left) + Order Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Categories, Search, Item Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Categories Bar */}
          <div className="hotel-card p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F7F7F5] focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === null
                    ? 'bg-[#C9A227] text-white shadow-xs'
                    : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory?.id === c.id
                      ? 'bg-[#C9A227] text-white shadow-xs'
                      : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Touch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loadingMenu ? (
              <div className="col-span-full py-12 text-center text-[#64748B]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C9A227] mb-2" />
                <p className="text-xs">Loading menu catalog...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#64748B] hotel-card">
                <Utensils className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
                <p className="text-xs font-semibold">No menu items found in this section.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="hotel-card p-4 hover:border-[#FED255] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#C9A227] tracking-wider uppercase">
                        {item.category_name || 'Outlet Item'}
                      </span>
                      <span className="font-headline font-bold text-sm text-[#0B1F3A]">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-[#0B1F3A] mt-1 group-hover:text-[#C9A227] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1">
                      {item.description || 'Prepared fresh by the culinary team.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F1F5F9]">
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {item.sku}
                    </span>
                    <button className="p-1 rounded-md bg-[#F4F4F2] text-[#0B1F3A] group-hover:bg-[#0B1F3A] group-hover:text-[#FED255] transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Order Slip / Cart */}
        <div className="lg:col-span-4 hotel-card p-5 space-y-4 shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
              <h2 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Current Order Ticket
              </h2>
            </div>
            {orderItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-[#DC2626] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Order Type & Target Table / Room */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-[#F4F4F2] p-1 rounded-lg">
              {['dine_in', 'room_service', 'takeaway'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 rounded-md text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                    orderType === type
                      ? 'bg-white text-[#0B1F3A] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0B1F3A]'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Room / Table Lookup */}
            {orderType === 'room_service' ? (
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Destination Suite:
                </label>
                <select
                  value={selectedStayId || ''}
                  onChange={(e) => {
                    const stayId = e.target.value ? Number(e.target.value) : null
                    setSelectedStayId(stayId)
                    const sel = checkedInRooms.find((r) => r.stayId === stayId || r.stay?.id === stayId)
                    setTableOrRoom(sel ? `Suite ${sel.number}` : '')
                  }}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="">Select Checked-In Room...</option>
                  {checkedInRooms.map((r) => (
                    <option key={r.id} value={r.stayId || r.stay?.id || r.id}>
                      Room {r.number} — {r.guest?.name || r.guestName || 'Occupied'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Table / Seating Station:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table 12, Bar Seat 3"
                  value={tableOrRoom}
                  onChange={(e) => setTableOrRoom(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            )}
          </div>

          {/* Cart Item Lines */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-[#94A3B8]">
                <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No items on ticket yet.</p>
                <p className="text-[10px] mt-0.5">Click any menu item to start order.</p>
              </div>
            ) : (
              orderItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-[#F7F7F5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-[#0B1F3A] block truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      ${item.unitPrice.toFixed(2)} x {item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#0B1F3A]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#0B1F3A]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-[#0B1F3A] w-14 text-right">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals Breakdown */}
          {orderItems.length > 0 && (
            <div className="pt-3 border-t border-[#F1F5F9] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Taxes & Service (7.5%):</span>
                <span className="font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-headline font-bold text-[#0B1F3A] pt-2 border-t border-[#F1F5F9]">
                <span>Total Due:</span>
                <span className="text-[#C9A227]">${totalAmount.toFixed(2)}</span>
              </div>

              {/* Checkout / Payment Trigger */}
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full mt-3 py-3 rounded-xl bg-[#0B1F3A] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#183153] transition-colors cursor-pointer shadow-md"
              >
                <CreditCard className="w-4 h-4 text-[#FED255]" />
                <span>Collect Payment / Post Charge</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Settlement Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-5 bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Select Payment Method
                </h3>
                <p className="text-xs text-[#64748B]">
                  Total Balance: <strong className="text-[#0B1F3A]">${totalAmount.toFixed(2)}</strong>
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'room_folio', label: 'Charge to Room', icon: Building, desc: 'Post directly to guest folio' },
                { id: 'card', label: 'Credit Card', icon: CreditCard, desc: 'POS terminal swipe / chip' },
                { id: 'cash', label: 'Cash Tender', icon: DollarSign, desc: 'Exact cash register' },
                { id: 'complimentary', label: 'Manager Comp', icon: Sparkles, desc: 'VIP / Service recovery' },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#C9A227] bg-[#FFFBEB]'
                        : 'border-[#E5E7EB] hover:border-[#94A3B8]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${paymentMethod === m.id ? 'text-[#C9A227]' : 'text-[#64748B]'}`} />
                    <div className="font-bold text-xs text-[#0B1F3A]">{m.label}</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">{m.desc}</div>
                  </button>
                )
              })}
            </div>

            {paymentMethod === 'room_folio' && !selectedStayId && (
              <div className="p-3 rounded-lg bg-[#FEF3C7] text-[#92400E] text-xs">
                ⚠️ Please select a Destination Suite on the order ticket before charging to room folio.
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessOrder}
                disabled={isProcessing}
                className="btn-primary flex-1 text-xs flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Print</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Order Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-sm p-6 space-y-4 bg-white animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Order Confirmed!
              </h3>
              <p className="text-xs text-[#64748B]">Ticket #{completedOrder.orderNumber}</p>
            </div>

            {/* Receipt Box */}
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB] text-left text-xs font-mono space-y-2">
              <div className="text-center font-bold pb-2 border-b border-[#E5E7EB]">
                {completedOrder.outletName}
              </div>
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>Type: {completedOrder.tableOrRoom}</span>
                <span>{completedOrder.createdAt}</span>
              </div>
              <div className="divide-y divide-[#E5E7EB] py-1">
                {completedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-[11px]">
                    <span>{it.quantity}x {it.name}</span>
                    <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#E5E7EB]">
                <span>Paid via:</span>
                <span className="uppercase">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#0B1F3A]">
                <span>Total:</span>
                <span>${completedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.print()
                  setCompletedOrder(null)
                }}
                className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="btn-primary flex-1 text-xs"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Z-Report Modal */}
      {zReportModalOpen && zReportData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-4 bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Daily Register Z-Report
                </h3>
                <p className="text-xs text-[#64748B]">Date: {zReportData.date}</p>
              </div>
              <button
                onClick={() => setZReportModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Completed Orders</span>
                <div className="font-headline font-bold text-xl text-[#0B1F3A] mt-1">
                  {zReportData.totalOrders}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Gross F&B Sales</span>
                <div className="font-headline font-bold text-xl text-[#059669] mt-1">
                  ${zReportData.totalSales.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#0B1F3A] block mb-2">
                Settlement Tender Breakdown:
              </span>
              <div className="space-y-1.5 text-xs">
                {zReportData.paymentBreakdown?.map((pb, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-2 rounded-lg bg-[#F7F7F5] border border-[#E5E7EB]"
                  >
                    <span className="font-semibold uppercase text-[#0B1F3A]">
                      {pb.payment_method.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-[#C9A227]">
                      ${Number(pb.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setZReportModalOpen(false)}
              className="btn-primary w-full text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
