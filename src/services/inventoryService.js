import { api } from './apiClient'

export const inventoryService = {
  async getCategories() {
    const res = await api.get('/admin/inventory/categories')
    return res.data || []
  },

  async getItems(categoryId, lowStock) {
    const params = {}
    if (categoryId) params.categoryId = categoryId
    if (lowStock) params.lowStock = 'true'
    const res = await api.get('/admin/inventory/items', { params })
    return res.data || []
  },

  async createItem(itemData) {
    const res = await api.post('/admin/inventory/items', itemData)
    return res.data
  },

  async recordTransaction(transactionData) {
    return await api.post('/admin/inventory/transactions', transactionData)
  },

  async restockMinibar(roomId, items) {
    return await api.post(`/admin/inventory/rooms/${roomId}/minibar-restock`, { items })
  },
}

export default inventoryService
