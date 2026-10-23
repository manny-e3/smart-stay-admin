import { api } from './apiClient'

/**
 * SmartStay PMS Synchronization & Webhooks Service (7 endpoints)
 * Handles Property Management System integrations (Opera, Cloudbeds, Mews) and webhook reconciliation
 */
export const pmsService = {
  /**
   * List configured PMS connections
   */
  async listConnections() {
    return await api.get('/admin/pms/connections')
  },

  /**
   * Add a new PMS connection
   * @param {Object} data - { name: string, vendor: 'http'|'mock', config?: object, isEnabled?: boolean }
   */
  async createConnection(data) {
    return await api.post('/admin/pms/connections', data)
  },

  /**
   * Edit an existing PMS connection
   * @param {number|string} connectionId
   * @param {Object} updates - { name?: string, config?: object, isEnabled?: boolean }
   */
  async updateConnection(connectionId, updates) {
    return await api.patch(`/admin/pms/connections/${connectionId}`, updates)
  },

  /**
   * Rotate and generate a new PMS webhook secret (shown once)
   * @param {number|string} connectionId
   */
  async rotateSecret(connectionId) {
    return await api.post(`/admin/pms/connections/${connectionId}/secret`, {})
  },

  /**
   * Trigger immediate manual reconciliation of in-house guests with the PMS
   * @param {number|string} connectionId
   */
  async syncNow(connectionId) {
    return await api.post(`/admin/pms/connections/${connectionId}/sync`, {})
  },

  /**
   * Query the PMS event audit stream
   * @param {Object} params - { connectionId, status, page, limit }
   */
  async listEvents(params = {}) {
    return await api.get('/admin/pms/events', params)
  },

  /**
   * Retry a failed PMS webhook event
   * @param {number|string} eventId
   */
  async retryEvent(eventId) {
    return await api.post(`/admin/pms/events/${eventId}/retry`, {})
  },
}

export default pmsService
