import { api } from './apiClient'

export const financeService = {
  async getFolios(status) {
    const params = status ? { status } : {}
    const res = await api.get('/admin/finance/folios', { params })
    return res.data || []
  },

  async getFolioDetail(id) {
    const res = await api.get(`/admin/finance/folios/${id}`)
    return res.data
  },

  async postCharge(id, chargeData) {
    return await api.post(`/admin/finance/folios/${id}/charge`, chargeData)
  },

  async settleFolio(id, paymentData) {
    return await api.post(`/admin/finance/folios/${id}/settle`, paymentData)
  },

  async getManagerDailyReport() {
    const res = await api.get('/admin/finance/reports/manager-daily')
    return res.data
  },
}

export default financeService
