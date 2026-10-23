import { api } from './apiClient'

export const requestsService = {
  /**
   * List staff requests with pagination and filters
   */
  async listRequests(filters = {}) {
    return await api.get('/admin/requests', filters)
  },

  /**
   * Get request detail and history
   */
  async getRequestDetail(requestId) {
    return await api.get(`/admin/requests/${requestId}`)
  },

  /**
   * Create request on behalf of a guest
   * @param {Object} data { roomId, category, description, priority }
   */
  async createRequest(data) {
    return await api.post('/admin/requests', data)
  },

  /**
   * Patch request (assignment, status, priority, note)
   */
  async updateRequest(requestId, updates) {
    return await api.patch(`/admin/requests/${requestId}`, updates)
  },

  /**
   * Assign or unassign request
   */
  async assignRequest(requestId, staffId) {
    return await this.updateRequest(requestId, { assignedTo: staffId })
  },

  /**
   * Start request (status: in_progress)
   */
  async startRequest(requestId, note = 'On my way') {
    return await this.updateRequest(requestId, { status: 'in_progress', note })
  },

  /**
   * Complete request (status: done)
   */
  async completeRequest(requestId) {
    return await this.updateRequest(requestId, { status: 'done' })
  },

  /**
   * Cancel request
   */
  async cancelRequest(requestId, note) {
    return await this.updateRequest(requestId, { status: 'cancelled', note })
  },

  /**
   * Change priority
   */
  async setPriority(requestId, priority) {
    return await this.updateRequest(requestId, { priority })
  },

  /**
   * Add operational note
   */
  async addNote(requestId, note) {
    return await this.updateRequest(requestId, { note })
  },

  /**
   * Get staff eligible to be assigned requests (front desk, housekeeping, maintenance)
   */
  async getAssignees() {
    return await api.get('/admin/requests/assignees')
  },
}

export default requestsService
