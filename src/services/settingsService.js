import { api } from './apiClient'

export const settingsService = {
  /**
   * Get hotel environmental and operational settings
   */
  async getSettings() {
    return await api.get('/admin/settings')
  },

  /**
   * Update hotel settings
   * @param {Object} settings { hotel_name, ac_min_temp, ac_max_temp, eco_enabled, eco_delay_minutes, ... }
   */
  async updateSettings(settings) {
    return await api.put('/admin/settings', settings)
  },
}

export default settingsService
