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

  /**
   * Assign an ESP32 Hub Device ID to a room
   * @param {string|number} roomNumber
   * @param {string} deviceId e.g. "SMART_101"
   * @param {string} ip optional local IP
   */
  async assignEsp32Hub(roomNumber, deviceId, ip = null) {
    return await api.post(`/integrations/esp32/rooms/${roomNumber}/assign-hub`, { deviceId, ip }, { skipAuth: true })
  },

  /**
   * Query real-time status of an ESP32 In-Room Hub
   * @param {string|number} roomNumber
   */
  async getEsp32Status(roomNumber) {
    return await api.get(`/integrations/esp32/rooms/${roomNumber}/status`, null, { skipAuth: true })
  },

  /**
   * Ingest ESP32 telemetry packet (BME680, PZEM-004T, Relays, Battery)
   * @param {Object} payload
   */
  async sendEsp32Telemetry(payload) {
    return await api.post('/integrations/esp32/telemetry', payload, { skipAuth: true })
  },

  /**
   * Toggle physical hardware relay (light, ac, tv, fridge)
   * @param {string|number} roomNumber
   * @param {string} deviceKey
   * @param {boolean} state
   */
  async toggleActuator(roomNumber, deviceKey, state) {
    return await api.post(`/integrations/esp32/rooms/${roomNumber}/actuator`, { deviceKey, state }, { skipAuth: true })
  },

  /**
   * Ingest emergency hardware alert (smoke, high heat, low battery)
   * @param {Object} payload
   */
  async sendEsp32Alert(payload) {
    return await api.post('/integrations/esp32/alert', payload, { skipAuth: true })
  },
}

export default deviceService
