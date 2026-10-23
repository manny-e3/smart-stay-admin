import { io } from 'socket.io-client'
import { getAccessToken } from './apiClient'

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) ||
  'http://localhost:5000'

let socket = null
const listeners = new Map()

/**
 * Initialize or re-initialize Socket.IO connection
 */
export function initSocket() {
  const token = getAccessToken()
  if (!token) {
    disconnectSocket()
    return null
  }

  if (socket && socket.connected) {
    return socket
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected to SmartStay live stream ID:', socket.id)
    window.dispatchEvent(new CustomEvent('smartstay:socket-status', { detail: { connected: true } }))
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason)
    window.dispatchEvent(new CustomEvent('smartstay:socket-status', { detail: { connected: false, reason } }))
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection error:', err.message)
    window.dispatchEvent(new CustomEvent('smartstay:socket-status', { detail: { connected: false, error: err.message } }))
  })

  socket.on('ready', (data) => {
    console.log('[Socket.IO] Staff session joined:', data)
  })

  // Global events forwarding to listeners
  const domainEvents = [
    'board:room',
    'board:refresh',
    'request:created',
    'request:updated',
    'alert:created',
    'alert:updated',
    'feedback:created',
    'rule:run',
    'adapter:health',
    'notification',
  ]

  domainEvents.forEach((eventName) => {
    socket.on(eventName, (payload) => {
      // Notify registered callbacks
      const cbs = listeners.get(eventName) || []
      cbs.forEach((cb) => {
        try {
          cb(payload)
        } catch (e) {
          console.error(`Error in socket listener for ${eventName}:`, e)
        }
      })
      // Also dispatch DOM custom event for global components
      window.dispatchEvent(new CustomEvent(`smartstay:${eventName}`, { detail: payload }))
    })
  })

  return socket
}

/**
 * Subscribe to a domain event
 * @returns {Function} Unsubscribe function
 */
export function onSocketEvent(eventName, callback) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, [])
  }
  listeners.get(eventName).push(callback)

  // Ensure socket is connected if we have a token
  if (!socket || !socket.connected) {
    initSocket()
  }

  return () => {
    const list = listeners.get(eventName) || []
    const idx = list.indexOf(callback)
    if (idx !== -1) {
      list.splice(idx, 1)
    }
  }
}

/**
 * Disconnect socket cleanly
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  window.dispatchEvent(new CustomEvent('smartstay:socket-status', { detail: { connected: false } }))
}

export default {
  initSocket,
  onSocketEvent,
  disconnectSocket,
}
