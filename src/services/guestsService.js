import { api } from './apiClient'

/**
 * SmartStay Guest Profiles & CRM Service (5 endpoints)
 * Handles guest dossiers, loyalty/VIP tiering, and GDPR right to erasure
 */
export const guestsService = {
  /**
   * Search guest profiles
   * @param {Object} params - { q, vip, includeAnonymized, page, limit }
   */
  async searchGuests(params = {}) {
    return await api.get('/admin/guests', params)
  },

  /**
   * Create a new guest profile
   * @param {Object} data - { firstName, lastName, email, phone, language, vip, notes }
   */
  async createGuest(data) {
    return await api.post('/admin/guests', data)
  },

  /**
   * Get guest profile with complete stay history
   * @param {number|string} guestId
   */
  async getGuest(guestId) {
    return await api.get(`/admin/guests/${guestId}`)
  },

  /**
   * Edit guest profile
   * @param {number|string} guestId
   * @param {Object} updates - { firstName, lastName, email, phone, language, vip, notes }
   */
  async updateGuest(guestId, updates) {
    return await api.patch(`/admin/guests/${guestId}`, updates)
  },

  /**
   * Remove personal details (GDPR right to erasure)
   * @param {number|string} guestId
   */
  async anonymiseGuest(guestId) {
    return await api.post(`/admin/guests/${guestId}/anonymise`, {})
  },
}

export default guestsService
