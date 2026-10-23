import { api } from './apiClient'

export const rulesService = {
  /**
   * List automation rules
   * @param {Object} filters { type: 'schedule'|'vacancy', enabled: true|false }
   */
  async listRules(filters = {}) {
    return await api.get('/admin/rules', filters)
  },

  /**
   * Get rule detail with recent runs
   */
  async getRuleDetail(ruleId) {
    return await api.get(`/admin/rules/${ruleId}`)
  },

  /**
   * Get run history for a rule
   */
  async getRuleRuns(ruleId, params = {}) {
    return await api.get(`/admin/rules/${ruleId}/runs`, params)
  },

  /**
   * Create vacancy or schedule rule
   * @param {Object} rule
   */
  async createRule(rule) {
    return await api.post('/admin/rules', rule)
  },

  /**
   * Edit existing rule
   */
  async updateRule(ruleId, updates) {
    return await api.patch(`/admin/rules/${ruleId}`, updates)
  },

  /**
   * Toggle rule enabled status
   */
  async setRuleEnabled(ruleId, isEnabled) {
    return await this.updateRule(ruleId, { isEnabled })
  },

  /**
   * Trigger rule run immediately
   */
  async runRuleNow(ruleId) {
    return await api.post(`/admin/rules/${ruleId}/run`)
  },
}

export default rulesService
