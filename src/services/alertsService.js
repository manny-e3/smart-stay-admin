import { api } from './apiClient'

export const alertsService = {
  /**
   * List hardware and guest alerts
   * @param {Object} filters
   */
  async listAlerts(filters = {}) {
    return await api.get('/admin/alerts', filters)
  },

  /**
   * Get alert detail with occurrences and device history
   */
  async getAlertDetail(alertId) {
    return await api.get(`/admin/alerts/${alertId}`)
  },

  /**
   * Resolve alert with mandatory resolution note
   * @param {string|number} alertId
   * @param {string} note
   */
  async resolveAlert(alertId, note) {
    return await api.patch(`/admin/alerts/${alertId}`, {
      status: 'resolved',
      note: note || 'Resolved by operational staff',
    })
  },
}

export default alertsService
