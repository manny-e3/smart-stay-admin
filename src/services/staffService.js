import { api } from './apiClient'

export const staffService = {
  /**
   * List staff accounts
   * @param {Object} params { page, limit, role, active: true|false, q }
   */
  async listStaff(params = {}) {
    return await api.get('/admin/staff', params)
  },

  /**
   * Get single staff profile
   */
  async getStaffDetail(staffId) {
    return await api.get(`/admin/staff/${staffId}`)
  },

  /**
   * Create staff member
   * @param {Object} data { name, email, role, password }
   */
  async createStaff(data) {
    return await api.post('/admin/staff', data)
  },

  /**
   * Edit staff profile (name, role, active, etc.)
   */
  async updateStaff(staffId, data) {
    return await api.patch(`/admin/staff/${staffId}`, data)
  },

  /**
   * Reset staff password (temporary password)
   */
  async resetPassword(staffId, password) {
    return await api.patch(`/admin/staff/${staffId}`, { password })
  },

  /**
   * Unlock account and/or reset 2FA OTP
   */
  async unlockOrResetOtp(staffId, { unlock = true, resetOtp = true } = {}) {
    return await api.patch(`/admin/staff/${staffId}`, { unlock, resetOtp })
  },
}

export default staffService
