import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  CreditCard,
  FileText,
  Printer,
  CheckCircle2,
  Building,
  Calendar,
  User,
  Plus,
  RefreshCw,
  TrendingUp,
  Percent,
  Receipt,
  X,
  Sparkles,
} from 'lucide-react'
import financeService from '../services/financeService'

export default function FolioBillingView() {
  const [folios, setFolios] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('open')
  const [loading, setLoading] = useState(true)
  const [managerMetrics, setManagerMetrics] = useState(null)

  // Folio Detail Drawer
  const [activeFolio, setActiveFolio] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Charge Posting Modal
  const [chargeModalOpen, setChargeModalOpen] = useState(false)
  const [chargeType, setChargeType] = useState('laundry')
  const [chargeDescription, setChargeDescription] = useState('')
  const [chargeAmount, setChargeAmount] = useState(25)

  // Settle Payment Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [settleMethod, setSettleMethod] = useState('credit_card')
  const [settleCardDigits, setSettleCardDigits] = useState('4242')

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [folioList, metrics] = await Promise.all([
        financeService.getFolios(selectedStatus),
        financeService.getManagerDailyReport().catch(() => null),
      ])
      setFolios(folioList)
      setManagerMetrics(metrics)
    } catch (err) {
      console.warn('Finance load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const handleOpenFolio = async (folioId) => {
    try {
      setDetailLoading(true)
      const detail = await financeService.getFolioDetail(folioId)
      setActiveFolio(detail)
    } catch (err) {
      showToast('Could not load folio statement')
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePostCharge = async () => {
    if (!activeFolio || !chargeDescription) {
      showToast('Please enter charge description')
      return
    }
    try {
      await financeService.postCharge(activeFolio.id, {
        chargeType,
        description: chargeDescription,
        amount: Number(chargeAmount),
      })
      showToast(`Charge of $${chargeAmount} posted to Folio ${activeFolio.folio_number}`)
      setChargeModalOpen(false)
      handleOpenFolio(activeFolio.id)
      loadData()
    } catch (err) {
      showToast(err.message || 'Charge failed')
    }
  }

  const handleSettleFolio = async () => {
    if (!activeFolio) return
    try {
      await financeService.settleFolio(activeFolio.id, {
        paymentMethod: settleMethod,
        cardLastFour: settleCardDigits,
      })
      showToast(`Folio ${activeFolio.folio_number} settled in full!`)
      setSettleModalOpen(false)
      handleOpenFolio(activeFolio.id)
      loadData()
    } catch (err) {
      showToast(err.message || 'Settlement failed')
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
            FINANCIAL AUDIT & GUEST FOLIOS
          </span>
          <h1 className="headline-xl">Folio Billing & Financial Ledger</h1>
          <p className="body-md text-[#64748B] mt-1">
            Room folios, itemized F&B charges, automatic tax calculations, and checkout settlements.
          </p>
        </div>
      </div>

      {/* Executive Financial Metrics */}
      {managerMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hotel-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Today's Revenue</span>
              <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
                ${managerMetrics.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-[#059669] font-bold">
                Room: ${managerMetrics.roomRevenue} | F&B: ${managerMetrics.fnbRevenue}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ECFDF5] text-[#059669]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="hotel-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Occupancy Rate</span>
              <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
                {managerMetrics.occupancyRate}%
              </div>
              <span className="text-[10px] text-[#64748B]">
                {managerMetrics.occupiedRooms} / {managerMetrics.totalRooms} Suites
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#DBEAFE] text-[#2563EB]">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="hotel-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Average Daily Rate (ADR)</span>
              <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
                ${managerMetrics.adr?.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#64748B]">RevPAR: ${managerMetrics.revpar?.toFixed(2)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#D97706]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="hotel-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase">Taxes Collected (7.5%)</span>
              <div className="font-headline font-bold text-2xl text-[#0B1F3A] mt-1">
                ${managerMetrics.taxesCollected?.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#64748B]">State Levy & Tourism Fund</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F3E8FF] text-[#9333EA]">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Folios Filter & Table */}
      <div className="hotel-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#C9A227]" />
            <h2 className="font-headline font-bold text-sm text-[#0B1F3A]">
              Guest Folios Ledger
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {['open', 'settled', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                {status === 'all' ? 'All Folios' : `${status} Folios`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E7EB] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Folio ID</th>
                <th className="py-3 px-4">Suite</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4 text-center">Stay Reference</th>
                <th className="py-3 px-4 text-center">Folio Status</th>
                <th className="py-3 px-4 text-right">Outstanding Balance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#64748B]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#C9A227] mb-1" />
                    <span>Loading guest folios...</span>
                  </td>
                </tr>
              ) : folios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#64748B]">
                    No folios found in this view.
                  </td>
                </tr>
              ) : (
                folios.map((f) => {
                  const isOpen = f.status === 'open'
                  return (
                    <tr key={f.id} className="hover:bg-[#F9F9F7] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F3A]">
                        {f.folio_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0B1F3A]">
                        Room {f.room_number || 'Suite'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0B1F3A]">
                        {f.first_name} {f.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#64748B] font-mono">
                        {f.stay_reference || `STAY-${f.stay_id}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isOpen
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : 'bg-[#ECFDF5] text-[#059669]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[#D97706] animate-pulse' : 'bg-[#059669]'}`} />
                          {f.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-headline font-bold text-sm text-[#0B1F3A]">
                        ${Number(f.balance).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenFolio(f.id)}
                          className="btn-secondary py-1 px-3 text-[11px] ml-auto flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>View Statement</span>
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

      {/* Folio Statement Modal / Drawer */}
      {activeFolio && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-2xl p-6 space-y-5 bg-white animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#7587A7] uppercase block">
                  OFFICIAL GUEST STATEMENT
                </span>
                <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                  Folio {activeFolio.folio_number}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Guest: <strong>{activeFolio.first_name} {activeFolio.last_name}</strong> | Room: <strong>{activeFolio.room_number}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-[#F4F4F2] text-[#0B1F3A] hover:bg-[#E5E7EB]"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveFolio(null)}
                  className="p-2 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Charges List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1F3A]">Itemized Charges:</span>
                {activeFolio.status === 'open' && (
                  <button
                    onClick={() => setChargeModalOpen(true)}
                    className="text-[11px] font-bold text-[#C9A227] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Post Incidental Charge</span>
                  </button>
                )}
              </div>

              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E5E7EB] text-[10px] font-bold text-[#64748B] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {activeFolio.charges?.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold uppercase text-[10px] text-[#0B1F3A]">
                          {c.charge_type.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3">{c.description}</td>
                        <td className="py-2.5 px-3 text-right text-[#64748B]">
                          ${Number(c.tax_amount).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#0B1F3A]">
                          ${(Number(c.amount) + Number(c.tax_amount)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments List */}
            {activeFolio.payments && activeFolio.payments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-[#0B1F3A] block mb-2">
                  Processed Payments:
                </span>
                <div className="space-y-1.5 text-xs">
                  {activeFolio.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between text-[#065F46]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                        <span>
                          {p.payment_method.toUpperCase()} (ending {p.card_last_four || 'card'})
                        </span>
                      </div>
                      <span className="font-bold">-${Number(p.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals Summary */}
            <div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#64748B] block">Current Balance Outstanding:</span>
                <div className="font-headline font-bold text-2xl text-[#0B1F3A]">
                  ${Number(activeFolio.balance).toFixed(2)}
                </div>
              </div>

              {activeFolio.status === 'open' && Number(activeFolio.balance) > 0 && (
                <button
                  onClick={() => setSettleModalOpen(true)}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Settle & Checkout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Charge Modal */}
      {chargeModalOpen && activeFolio && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-4 bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Post Manual Charge
              </h3>
              <button
                onClick={() => setChargeModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Charge Category:
                </label>
                <select
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold"
                >
                  <option value="laundry">🧺 Express Laundry Service</option>
                  <option value="spa">💆 Spa & Wellness Treatment</option>
                  <option value="late_checkout">🕒 Late Check-out Fee</option>
                  <option value="damage">⚠️ Suite Damage / Incidentals</option>
                  <option value="service_charge">🛎️ Custom Concierge Directives</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2x Silk Shirt Express Pressing"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Amount ($ USD):
                </label>
                <input
                  type="number"
                  min="1"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setChargeModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePostCharge}
                className="btn-primary flex-1 text-xs"
              >
                Post Charge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle & Checkout Modal */}
      {settleModalOpen && activeFolio && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="hotel-card w-full max-w-md p-6 space-y-4 bg-white animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
                Settle Folio & Finalize Balance
              </h3>
              <p className="text-xs text-[#64748B]">
                Amount to settle: <strong className="text-[#0B1F3A]">${Number(activeFolio.balance).toFixed(2)}</strong>
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                  Payment Method:
                </label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-semibold"
                >
                  <option value="credit_card">💳 Credit Card (Terminal Swipe / Token)</option>
                  <option value="cash">💵 Cash Settlement</option>
                  <option value="bank_transfer">🏦 Direct Corporate Wire</option>
                </select>
              </div>

              {settleMethod === 'credit_card' && (
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] uppercase block mb-1">
                    Card Last 4 Digits:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={settleCardDigits}
                    onChange={(e) => setSettleCardDigits(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-center"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSettleModalOpen(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSettleFolio}
                className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Process Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
