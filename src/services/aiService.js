import { api } from './apiClient'

export const aiService = {
  async askCopilot({ task, context, prompt }) {
    const res = await api.post('/admin/ai/copilot', { task, context, prompt })
    return res.data
  },

  async sendGuestChat({ message, roomId, stayId, guestName }) {
    const res = await api.post('/admin/ai/guest-chat', { message, roomId, stayId, guestName })
    return res.data
  },
}

export default aiService
