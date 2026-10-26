import React, { useState, useEffect } from 'react'
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Coffee,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import inventoryService from '../services/inventoryService'
import roomsService from '../services/roomsService'

export default function InventoryManagementView() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals
  const [intakeModalOpen, setIntakeModalOpen] = useState(false)
  const [selectedItemForIntake, setSelectedItemForIntake] = useState(null)
  const [intakeQty, setIntakeQty] = useState(10)
  const [intakeType, setIntakeType] = useState('purchase_intake')
  const [intakeNotes, setIntakeNotes] = useState('')

  // Minibar Restock Drawer
  const [minibarDrawerOpen, setMinibarDrawerOpen] = useState(false)
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [minibarSelections, setMinibarSelections] = useState({})

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemList, catList, roomsBoard] = await Promise.all([
        inventoryService.getItems(selectedCategory?.id, lowStockOnly),
        inventoryService.getCategories(),
        roomsService.getRoomBoard().catch(() => ({ floors: [] })),
      ])
      setItems(itemList)
      setCategories(catList)

      const flatRooms = []
      if (roomsBoard?.floors) {
        roomsBoard.floors.forEach((f) => {
          if (f.rooms) flatRooms.push(...f.rooms)
        })
      }
      setRooms(flatRooms)
    } catch (err) {
      console.warn('Failed to load inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCategory, lowStockOnly])

  const handleRecordTransaction = async () => {
    if (!selectedItemForIntake) return
    try {
      await inventoryService.recordTransaction({
        itemId: selectedItemForIntake.id,
        type: intakeType,
        quantity: intakeQty,
        notes: intakeNotes,
      })
      showToast(`Stock updated for ${selectedItemForIntake.name}`)
      setIntakeModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message || 'Transaction failed')
    }
  }

  const handleMinibarRestock = async () => {
    if (!selectedRoomId) {
      showToast('Please select a suite')
      return
    }

    const payloadItems = Object.entries(minibarSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, consumedQty]) => ({
        itemId: Number(itemId),
        consumedQty,
        chargeGuest: true,
      }))

    if (payloadItems.length === 0) {
      showToast('Please specify at least one consumed minibar item')
      return
    }

    try {
      await inventoryService.restockMinibar(selectedRoomId, payloadItems)
      showToast(`Minibar replenished for Suite. Charges posted to Folio!`)
      setMinibarDrawerOpen(false)
      setMinibarSelections({})
      loadData()
    } catch (err) {
      showToast(err.message || 'Restock failed')
    }
  }

  const filteredItems = items.filter((it) => {
    if (!searchQuery) return true
    return (
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Summary Metrics
  const lowStockCount = items.filter((i) => i.current_stock <= i.min_reorder_level).length
  const totalValuation = items.reduce((sum, i) => sum + i.current_stock * Number(i.unit_cost || 0), 0)

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
            LOGISTICS & PAR CONTROLS
          </span>
          <h1 className="headline-xl">Physical Stock & Minibar Inventory</h1>
          <p className="body-md text-[#64748B] mt-1">
            Real-time consumables tracking, master linens, guest toiletries, and automated minibar billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMinibarDrawerOpen(true)}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <Coffee className="w-4 h-4 text-[#C9A227]" />
            <span>Minibar Restock Suite</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hotel-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Total Catalog SKUs</span>
            <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
              {items.length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#DBEAFE] text-[#2563EB]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="hotel-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Low Stock Alerts</span>
            <div className={`font-headline font-bold text-2xl mt-1 ${lowStockCount > 0 ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
              {lowStockCount} Items
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#ECFDF5] text-[#059669]'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="hotel-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase">Asset Inventory Value</span>
            <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#D97706]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="hotel-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F7F7F5] focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  selectedCategory?.id === c.id
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            lowStockOnly
              ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
              : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Low Stock Reorders Only</span>
        </button>
      </div>

      {/* Inventory Items Table */}
      <div className="hotel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E7EB] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Par Level</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Health Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#64748B]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#C9A227] mb-1" />
                    <span>Loading stock counts...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#64748B]">
                    No inventory records match current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.current_stock <= item.min_reorder_level
                  return (
                    <tr key={item.id} className="hover:bg-[#F9F9F7] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0B1F3A]">{item.name}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{item.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {item.category_name || 'General Supply'}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {item.location || 'Central Warehouse'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-sm text-[#0B1F3A]">
                        {item.current_stock} <span className="text-[10px] font-normal text-[#64748B]">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#64748B]">
                        {item.par_level} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#0B1F3A]">
                        ${Number(item.unit_cost).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isLow
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#ECFDF5] text-[#059669]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-[#DC2626] animate-pulse' : 'bg-[#059669]'}`} />
                          {isLow ? 'Reorder Needed' : 'Optimal Par'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItemForIntake(item)
                            setIntakeQty(10)
                            setIntakeModalOpen(true)
                          }}
                          className="px-2.5 py-1 rounded-md bg-[#F4F4F2] hover:bg-[#0B1F3A] hover:text-white font-bold text-[11px] text-[#0B1F3A] transition-colors cursor-pointer"
                        >
                          Adjust / Intake
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment / Intake Modal */}
      {intakeModalOpen && selectedItemForIntake && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-4 bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Record Stock Adjustment
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedItemForIntake.name} ({selectedItemForIntake.sku})
                </p>
              </div>
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Transaction Type:
                </label>
                <select
                  value={intakeType}
                  onChange={(e) => setIntakeType(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="purchase_intake">📦 Purchase Intake (Delivery from Vendor)</option>
                  <option value="room_refill">🛏️ Linen / Amenities Refill to Suite</option>
                  <option value="minibar_refill">🍾 Minibar Restock</option>
                  <option value="wastage">🗑️ Wastage / Spoilage / Broken</option>
                  <option value="adjustment">⚖️ Audit Cycle Count Adjustment</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Quantity ({selectedItemForIntake.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={intakeQty}
                  onChange={(e) => setIntakeQty(Number(e.target.value))}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Audit Notes / Reference:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received from shipment #9901"
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordTransaction}
                className="btn-primary flex-1 text-xs"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minibar Suite Replenishment Drawer */}
      {minibarDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end">
          <div className="hotel-card w-full max-w-md h-full rounded-none p-6 space-y-5 bg-white flex flex-col justify-between animate-fade-in overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                    Suite Minibar Replenishment
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Select consumed beverages & automatically post charges to guest folio.
                  </p>
                </div>
                <button
                  onClick={() => setMinibarDrawerOpen(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Target Suite:
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="">Select Suite Number...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} ({r.roomType || 'Standard'} - {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block mb-2">
                  Consumed Minibar Items:
                </span>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {items
                    .filter((i) => i.category_name?.toLowerCase().includes('minibar'))
                    .map((mItem) => {
                      const count = minibarSelections[mItem.id] || 0
                      return (
                        <div
                          key={mItem.id}
                          className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#0B1F3A] block">
                              {mItem.name}
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              Stock: {mItem.current_stock} | Unit Cost: ${Number(mItem.unit_cost).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setMinibarSelections((prev) => ({
                                  ...prev,
                                  [mItem.id]: Math.max(0, count - 1),
                                }))
                              }
                              className="w-6 h-6 rounded bg-white border border-[#E5E7EB] flex items-center justify-center font-bold text-[#64748B]"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-bold">{count}</span>
                            <button
                              onClick={() =>
                                setMinibarSelections((prev) => ({
                                  ...prev,
                                  [mItem.id]: count + 1,
                                }))
                              }
                              className="w-6 h-6 rounded bg-white border border-[#E5E7EB] flex items-center justify-center font-bold text-[#64748B]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] space-y-2">
              <button
                onClick={handleMinibarRestock}
                className="btn-primary w-full text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Replenish & Charge Room Folio</span>
              </button>
              <button
                onClick={() => setMinibarDrawerOpen(false)}
                className="btn-secondary w-full text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
