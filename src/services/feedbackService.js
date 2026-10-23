import { api } from './apiClient'

export const feedbackService = {
  /**
   * List guest feedback with rating distributions and time-series averages
   * @param {Object} params { groupBy: 'day'|'week'|'month', from, to, minRating, maxRating, roomId, floor, category, hasPhotos: true }
   */
  async listFeedback(params = {}) {
    return await api.get('/admin/feedback', params)
  },
}

export default feedbackService
