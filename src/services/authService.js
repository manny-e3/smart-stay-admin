import { api, setTokens, clearTokens } from './apiClient'
import { initSocket, disconnectSocket } from './socket'

export const authService = {
  /**
   * Log in with credentials and optional OTP
   */
  async login(email, password, otp = undefined) {
    const payload = { email, password }
    if (otp) payload.otp = otp

    const data = await api.post('/staff/login', payload, { skipAuth: true })
    const { accessToken, refreshToken, staff } = data

    setTokens(accessToken, refreshToken)
    localStorage.setItem('smartstay_current_staff', JSON.stringify(staff))
    initSocket()

    return data
  },

  /**
   * Refresh token pair
   */
  async refresh(refreshToken) {
    const data = await api.post('/staff/refresh', { refreshToken }, { skipAuth: true })
    const { accessToken, refreshToken: newRefresh, staff } = data
    setTokens(accessToken, newRefresh)
    if (staff) {
      localStorage.setItem('smartstay_current_staff', JSON.stringify(staff))
    }
    return data
  },

  /**
   * End staff session
   */
  async logout() {
    const refreshToken = localStorage.getItem('smartstay_refresh_token')
    try {
      if (refreshToken) {
        await api.post('/staff/logout', { refreshToken })
      }
    } catch (e) {
      console.warn('Logout API failed or session already terminated:', e.message)
    } finally {
      clearTokens()
      disconnectSocket()
    }
  },

  /**
   * Get current authenticated staff profile
   */
  async getProfile() {
    return await api.get('/staff/me')
  },

  /**
   * Update password
   */
  async changePassword(currentPassword, newPassword) {
    return await api.post('/staff/me/password', { currentPassword, newPassword })
  },

  /**
   * Generate 2FA OTP secret and QR URI
   */
  async setupOtp() {
    return await api.post('/staff/me/otp/setup')
  },

  /**
   * Enable 2FA with 6-digit code
   */
  async enableOtp(code) {
    return await api.post('/staff/me/otp/enable', { code })
  },

  /**
   * Disable 2FA
   */
  async disableOtp(code) {
    return await api.post('/staff/me/otp/disable', { code })
  },

  /**
   * Browser Push Public Key
   */
  async getPushPublicKey() {
    return await api.get('/staff/push/public-key', null, { skipAuth: true })
  },

  /**
   * Save Web Push subscription
   */
  async savePushSubscription(subscription) {
    return await api.post('/staff/me/push-subscriptions', subscription)
  },

  /**
   * Delete Web Push subscription
   */
  async deletePushSubscription(endpoint) {
    return await api.delete('/staff/me/push-subscriptions', { endpoint })
  },
}

export default authService
