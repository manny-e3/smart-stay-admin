import { api } from './apiClient'

export const roomsService = {
  /**
   * Fetch room board with optional filters
   * @param {Object} filters { floor: '1,2', status: 'alert,request,dnd,occupied,vacant', roomType: 'Suite' }
   */
  async getRoomBoard(filters = {}) {
    return await api.get('/admin/rooms/board', filters)
  },

  /**
   * Fetch room detail with guests, stays, requests, alerts, and devices
   * @param {string|number} roomId
   */
  /**
   * Fetch room detail with guests, stays, requests, alerts, and devices
   * @param {string|number} roomId
   */
  async getRoomDetail(roomId) {
    return await api.get(`/admin/rooms/${roomId}`)
  },

  /**
   * Create a new room
   * @param {Object} data { number: string, floor: number, roomType?: string, isActive?: boolean }
   */
  async createRoom(data) {
    return await api.post('/admin/rooms', data)
  },

  /**
   * Update an existing room
   * @param {string|number} roomId
   * @param {Object} data { number?: string, floor?: number, roomType?: string|null, isActive?: boolean, dnd?: boolean }
   */
  async updateRoom(roomId, data) {
    return await api.patch(`/admin/rooms/${roomId}`, data)
  },

  /**
   * Delete or deactivate a room
   * @param {string|number} roomId
   */
  async deleteRoom(roomId) {
    return await api.delete(`/admin/rooms/${roomId}`)
  },

  /**
   * Upload a room photo from a base64 dataUrl
   * @param {string} dataUrl
   */
  async uploadPhoto(dataUrl) {
    return await api.post('/admin/rooms/upload', { dataUrl })
  },
}

export default roomsService
