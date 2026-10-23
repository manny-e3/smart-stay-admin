import { api } from './apiClient'

export const energyService = {
  /**
   * Fetch energy analytics data
   * @param {Object} params { groupBy: 'room'|'floor', interval: 'day'|'hour', from, to, roomId }
   */
  async getEnergy(params = {}) {
    return await api.get('/admin/energy', params)
  },

  /**
   * Download energy analytics as CSV
   */
  async exportCsv(interval = 'day', dateRange = {}) {
    const blob = await api.downloadBlob('/admin/energy/export', {
      interval,
      ...dateRange,
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smartstay-energy-${interval}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}

export default energyService
