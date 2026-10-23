import { api } from './apiClient'

export const deviceService = {
  /**
   * Get entire room and device topology mapping
   */
  async getMapping() {
    return await api.get('/admin/rooms/mapping')
  },

  /**
   * Replace room and device mapping
   */
  async replaceMapping(mapping) {
    return await api.put('/admin/rooms/mapping', mapping)
  },

  /**
   * Get hardware adapter health statuses
   */
  async getAdapters() {
    return await api.get('/admin/rooms/mapping/adapters')
  },

  /**
   * Run health check against a specific hardware adapter
   */
  async checkAdapter(adapterId) {
    return await api.post(`/admin/rooms/mapping/adapters/${adapterId}/check`)
  },

  /**
   * Generate new webhook secret for an adapter
   */
  async generateAdapterSecret(adapterId) {
    return await api.post(`/admin/rooms/mapping/adapters/${adapterId}/secret`)
  },

  /**
   * Ingest external IoT events via webhook (POST /integrations/adapters/:adapterId/events)
   * @param {string|number} adapterId
   * @param {string} secret X-Adapter-Secret header
   * @param {Array} events [{ externalId, type, payload }]
   */
  async sendDeviceEvents(adapterId, secret, events) {
    return await api.post(`/integrations/adapters/${adapterId}/events`, { events }, {
      headers: {
        'X-Adapter-Secret': secret,
      },
      skipAuth: true,
    })
  },
}

export default deviceService
