import { api } from './apiClient'

/**
 * SmartStay Stays & Reservations Service
 * Handles full reservation and in-house guest lifecycle (12 endpoints)
 */
export const staysService = {
  /**
   * Search stays with filters
   * @param {Object} params - { status, arrivalDate, departureDate, inHouse, roomId, q, page, limit }
   */
  async searchStays(params = {}) {
    return await api.get('/admin/stays', params)
  },

  /**
   * Create a reservation or walk-in booking
   * @param {Object} data - { guest: { id } | GuestInput, companions, roomId, roomType, arrival, departure, adults, children, notes, checkInNow }
   */
  async createStay(data) {
    return await api.post('/admin/stays', data)
  },

  /**
   * Get stay by ID with guests, history, requests, and digital keys
   * @param {number|string} stayId
   */
  async getStay(stayId) {
    return await api.get(`/admin/stays/${stayId}`)
  },

  /**
   * Edit a booking
   * @param {number|string} stayId
   * @param {Object} updates - { arrival, departure, roomId, roomType, adults, children, notes, addGuests }
   */
  async updateStay(stayId, updates) {
    return await api.patch(`/admin/stays/${stayId}`, updates)
  },

  /**
   * Check in a reservation
   * @param {number|string} stayId
   * @param {Object} [data] - { roomId } (optional if already assigned)
   */
  async checkIn(stayId, data = {}) {
    return await api.post(`/admin/stays/${stayId}/check-in`, data)
  },

  /**
   * Check out an in-house stay
   * @param {number|string} stayId
   * @param {Object} [data] - { note }
   */
  async checkOut(stayId, data = {}) {
    return await api.post(`/admin/stays/${stayId}/check-out`, data)
  },

  /**
   * Move stay to another room
   * @param {number|string} stayId
   * @param {Object} data - { roomId, reason }
   */
  async moveRoom(stayId, data) {
    return await api.post(`/admin/stays/${stayId}/move`, data)
  },

  /**
   * Change departure date (extend or shorten)
   * @param {number|string} stayId
   * @param {Object} data - { departure }
   */
  async extendStay(stayId, data) {
    return await api.post(`/admin/stays/${stayId}/extend`, data)
  },

  /**
   * Cancel a reservation
   * @param {number|string} stayId
   * @param {Object} [data] - { reason }
   */
  async cancelStay(stayId, data = {}) {
    return await api.post(`/admin/stays/${stayId}/cancel`, data)
  },

  /**
   * Mark reservation as no-show
   * @param {number|string} stayId
   * @param {Object} [data] - { reason }
   */
  async markNoShow(stayId, data = {}) {
    return await api.post(`/admin/stays/${stayId}/no-show`, data)
  },

  /**
   * Generate new guest app access code
   * @param {number|string} stayId
   * @param {Object} [options] - { signOutDevices: boolean }
   */
  async generateAccessCode(stayId, options = { signOutDevices: true }) {
    return await api.post(`/admin/stays/${stayId}/access-code`, options)
  },

  /**
   * Revoke and re-issue digital keys
   * @param {number|string} stayId
   */
  async issueKeys(stayId) {
    return await api.post(`/admin/stays/${stayId}/keys`, {})
  },

  /**
   * Get or generate scannable QR pass for a stay
   * @param {number|string} stayId
   */
  async getStayQr(stayId) {
    return await api.get(`/admin/stays/${stayId}/qr`)
  },

  /**
   * Scan guest QR code for instant lookup and check-in
   * @param {Object} data - { qrData: string, checkInNow?: boolean, roomId?: number }
   */
  async scanGuestQr(data) {
    return await api.post('/admin/stays/scan-qr', data)
  },
}

export default staysService
