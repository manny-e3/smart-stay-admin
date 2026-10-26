import React, { useState, useEffect } from 'react'
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  Mail,
  Phone,
  FileText,
  Search,
  Filter,
  DollarSign,
  PackageCheck,
  Star,
  RefreshCw,
  X,
} from 'lucide-react'
import procurementService from '../services/procurementService'
import inventoryService from '../services/inventoryService'

export default function ProcurementView() {
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [newPoModalOpen, setNewPoModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [activePoDetail, setActivePoDetail] = useState(null)

  // New PO Form
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [poNotes, setPoNotes] = useState('')
  const [poLines, setPoLines] = useState([{ itemId: '', orderedQuantity: 10, unitPrice: 0 }])

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [pos, vends, items] = await Promise.all([
        procurementService.getOrders(selectedStatus),
        procurementService.getVendors(),
        inventoryService.getItems(),
      ])
      setOrders(pos)
      setVendors(vends)
      setInventoryItems(items)
    } catch (err) {
      console.warn('Procurement load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const handleCreatePo = async () => {
    if (!selectedVendorId) {
      showToast('Please select a supplier vendor')
      return
    }

    const validLines = poLines.filter((l) => l.itemId && l.orderedQuantity > 0)
    if (validLines.length === 0) {
      showToast('Please add at least one inventory item to order')
      return
    }

    try {
      const created = await procurementService.createOrder({
        vendorId: Number(selectedVendorId),
        expectedDeliveryDate: deliveryDate,
        notes: poNotes,
        items: validLines.map((l) => ({
          itemId: Number(l.itemId),
          orderedQuantity: Number(l.orderedQuantity),
          unitPrice: Number(l.unitPrice),
        })),
      })
      showToast(`Purchase Order ${created.poNumber} created and dispatched!`)
      setNewPoModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to create PO')
    }
  }

  const handleOpenReceive = async (po) => {
    try {
      const detail = await procurementService.getOrderDetail(po.id)
      setActivePoDetail(detail)
      setReceiveModalOpen(true)
    } catch (err) {
      showToast('Could not load PO details')
    }
  }

  const handleConfirmReceive = async () => {
    if (!activePoDetail) return
    try {
      const payload = activePoDetail.items.map((it) => ({
        itemId: it.item_id,
        qtyReceived: it.ordered_quantity,
      }))
      await procurementService.receiveOrder(activePoDetail.id, payload)
      showToast(`Goods received for ${activePoDetail.po_number}. Inventory stock updated!`)
      setReceiveModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message || 'Receive dock error')
    }
  }

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
            SUPPLIER NETWORK & PROCUREMENT
          </span>
          <h1 className="headline-xl">Procurement & Purchase Orders</h1>
          <p className="body-md text-[#64748B] mt-1">
            Vendor contracts, purchase orders lifecycle, and receiving dock automated stock intake.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPoLines([{ itemId: '', orderedQuantity: 10, unitPrice: 0 }])
              setNewPoModalOpen(true)
            }}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Verified Vendors Carousel / Grid */}
      <div>
        <h2 className="font-headline font-bold text-sm text-[#0B1F3A] mb-3">
          Contracted Property Vendors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <div key={v.id} className="hotel-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                    {v.company_name}
                  </h3>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    Attn: {v.contact_name || 'Accounts Representative'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#D97706]" />
                  <span>{v.rating || '4.5'}</span>
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#64748B] border-t border-[#F1F5F9] pt-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="truncate">{v.email || 'vendor@smartstay.local'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>{v.phone || '+1 (555) 234-5678'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-[11px]">
                <span className="text-[#94A3B8]">Terms:</span>
                <span className="font-bold text-[#0B1F3A]">{v.payment_terms || 'Net 30'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Filter & Table */}
      <div className="hotel-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C9A227]" />
            <h2 className="font-headline font-bold text-sm text-[#0B1F3A]">
              Purchase Orders Ledger
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {[null, 'ordered', 'received', 'draft'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                {status || 'All Orders'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E7EB] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor Supplier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Expected Delivery</th>
                <th className="py-3 px-4 text-right">Order Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#64748B]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#C9A227] mb-1" />
                    <span>Loading purchase orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#64748B]">
                    No purchase orders in this status.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const isReceived = po.status === 'received'
                  return (
                    <tr key={po.id} className="hover:bg-[#F9F9F7] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F3A]">
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0B1F3A]">
                        {po.vendor_name}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isReceived
                              ? 'bg-[#ECFDF5] text-[#059669]'
                              : 'bg-[#DBEAFE] text-[#2563EB]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isReceived ? 'bg-[#059669]' : 'bg-[#2563EB] animate-pulse'}`} />
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#64748B]">
                        {po.expected_delivery_date
                          ? new Date(po.expected_delivery_date).toLocaleDateString()
                          : 'Pending Dispatch'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sm text-[#0B1F3A]">
                        ${Number(po.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isReceived ? (
                          <button
                            onClick={() => handleOpenReceive(po)}
                            className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1 ml-auto"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive Dock</span>
                          </button>
                        ) : (
                          <span className="text-[#059669] font-bold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Inventory Ingested</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {newPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-lg p-6 space-y-4 bg-white animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  New Purchase Order
                </h3>
                <p className="text-xs text-[#64748B]">
                  Issue vendor procurement requisition with auto-receiving hooks.
                </p>
              </div>
              <button
                onClick={() => setNewPoModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Supplier Vendor:
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.company_name} ({v.payment_terms})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Expected Delivery Date:
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0B1F3A]">Order Lines:</span>
                  <button
                    onClick={() =>
                      setPoLines([...poLines, { itemId: '', orderedQuantity: 10, unitPrice: 0 }])
                    }
                    className="text-[11px] font-bold text-[#C9A227] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {poLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={line.itemId}
                        onChange={(e) => {
                          const itemId = e.target.value
                          const it = inventoryItems.find((i) => i.id === Number(itemId))
                          const updated = [...poLines]
                          updated[idx] = {
                            ...updated[idx],
                            itemId,
                            unitPrice: it ? Number(it.unit_cost) : 0,
                          }
                          setPoLines(updated)
                        }}
                        className="flex-1 bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-xs font-semibold"
                      >
                        <option value="">Choose Inventory Item...</option>
                        {inventoryItems.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} (Stock: {i.current_stock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.orderedQuantity}
                        onChange={(e) => {
                          const updated = [...poLines]
                          updated[idx].orderedQuantity = Number(e.target.value)
                          setPoLines(updated)
                        }}
                        className="w-20 bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-xs font-bold text-center"
                      />

                      <div className="w-20 text-right font-bold text-xs">
                        ${(line.unitPrice * line.orderedQuantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setNewPoModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePo}
                className="btn-primary flex-1 text-xs"
              >
                Submit Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receiving Dock Inspection Modal */}
      {receiveModalOpen && activePoDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-4 bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                  Receiving Dock Inspection
                </h3>
                <p className="text-xs text-[#64748B]">
                  Confirm shipment delivery for {activePoDetail.po_number}
                </p>
              </div>
              <button
                onClick={() => setReceiveModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0B1F3A] block">
                Delivered Line Items:
              </span>
              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl p-3 bg-[#F7F7F5] space-y-2">
                {activePoDetail.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1">
                    <div>
                      <span className="font-bold text-[#0B1F3A] block">{it.item_name}</span>
                      <span className="text-[10px] text-[#64748B]">SKU: {it.item_sku}</span>
                    </div>
                    <span className="font-bold text-sm text-[#059669]">
                      ✓ {it.ordered_quantity} {it.item_unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#ECFDF5] text-[#065F46] text-xs">
              ⚡ Confirming receipt will automatically credit warehouse stock and generate audit intake records.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReceiveModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceive}
                className="btn-primary flex-1 text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Ingest Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
