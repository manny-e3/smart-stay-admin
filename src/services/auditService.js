import { api } from './apiClient'

export const auditService = {
  /**
   * Search audit trail
   * @param {Object} params { page, limit, staffId, actorType, action, entityType, entityId, roomId, from, to, q }
   */
  async searchAudit(params = {}) {
    return await api.get('/admin/audit', params)
  },
}

export default auditService
