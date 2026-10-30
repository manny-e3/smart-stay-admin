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

  /**
   * Fetch devices configured for a specific room
   * @param {string|number} roomId
   */
  async getRoomDevices(roomId) {
    return await api.get(`/admin/rooms/${roomId}/devices`)
  },

  /**
   * Add a connected hardware device to a specific room
   * @param {string|number} roomId
   * @param {Object} data { name: string, type: string, externalId?: string, adapterId?: number, online?: boolean }
   */
  async addRoomDevice(roomId, data) {
    return await api.post(`/admin/rooms/${roomId}/devices`, data)
  },

  /**
   * Update device settings or state
   * @param {string|number} roomId
   * @param {string|number} deviceId
   * @param {Object} data
   */
  async updateRoomDevice(roomId, deviceId, data) {
    return await api.patch(`/admin/rooms/${roomId}/devices/${deviceId}`, data)
  },

  /**
   * Remove a hardware device from a room
   * @param {string|number} roomId
   * @param {string|number} deviceId
   */
  async deleteRoomDevice(roomId, deviceId) {
    return await api.delete(`/admin/rooms/${roomId}/devices/${deviceId}`)
  },
}

export default roomsService
