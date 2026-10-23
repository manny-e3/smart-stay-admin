import { api } from './apiClient'

/**
 * SmartStay Front Desk Operations Service (2 endpoints)
 * Handles daily manifest (arrivals, departures, overdue) and date-range room availability
 */
export const frontDeskService = {
  /**
   * Get today's operational manifest (arrivals, departures, in-house, overdue check-outs)
   */
  async getTodayManifest() {
    return await api.get('/admin/front-desk/today')
  },

  /**
   * Check room availability across a date range
   * @param {Object} params - { from: ISOString, to: ISOString, roomType?: string }
   */
  async checkRoomAvailability(params) {
    return await api.get('/admin/rooms/availability', params)
  },
}

export default frontDeskService
