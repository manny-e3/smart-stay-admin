import { api } from './apiClient'

export const posService = {
  async getOutlets() {
    const res = await api.get('/admin/pos/outlets')
    return res.data || []
  },

  async getCategories(outletId) {
    const res = await api.get('/admin/pos/categories', {
      params: outletId ? { outletId } : {},
    })
    return res.data || []
  },

  async getMenu(outletId, categoryId) {
    const params = {}
    if (outletId) params.outletId = outletId
    if (categoryId) params.categoryId = categoryId
    const res = await api.get('/admin/pos/menu', { params })
    return res.data || []
  },

  async getOrders(status, outletId) {
    const params = {}
    if (status) params.status = status
    if (outletId) params.outletId = outletId
    const res = await api.get('/admin/pos/orders', { params })
    return res.data || []
  },

  async createOrder(orderData) {
    const res = await api.post('/admin/pos/orders', orderData)
    return res.data
  },

  async getOrderDetail(id) {
    const res = await api.get(`/admin/pos/orders/${id}`)
    return res.data
  },

  async updateOrderStatus(id, status) {
    return await api.patch(`/admin/pos/orders/${id}/status`, { status })
  },

  async payOrder(id, paymentData) {
    return await api.post(`/admin/pos/orders/${id}/pay`, paymentData)
  },

  async chargeToRoom(id, stayId) {
    return await api.post(`/admin/pos/orders/${id}/charge-to-room`, { stayId })
  },

  async getDailyZReport() {
    const res = await api.get('/admin/pos/reports/daily-z')
    return res.data
  },
}

export default posService
