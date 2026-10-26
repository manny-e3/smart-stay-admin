import { api } from './apiClient'

export const procurementService = {
  async getVendors() {
    const res = await api.get('/admin/procurement/vendors')
    return res.data || []
  },

  async createVendor(vendorData) {
    const res = await api.post('/admin/procurement/vendors', vendorData)
    return res.data
  },

  async getOrders(status) {
    const params = status ? { status } : {}
    const res = await api.get('/admin/procurement/orders', { params })
    return res.data || []
  },

  async createOrder(orderData) {
    const res = await api.post('/admin/procurement/orders', orderData)
    return res.data
  },

  async getOrderDetail(id) {
    const res = await api.get(`/admin/procurement/orders/${id}`)
    return res.data
  },

  async receiveOrder(id, receivedItems) {
    return await api.post(`/admin/procurement/orders/${id}/receive`, { receivedItems })
  },
}

export default procurementService
