/**
 * SmartStay Central API Client
 * Robust fetch-based HTTP client with automatic JWT bearer attachment,
 * token rotation/auto-refresh, standard error parsing, and blob downloads.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) ||
  'http://localhost:5000'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

export function getAccessToken() {
  return localStorage.getItem('smartstay_access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('smartstay_refresh_token')
}

export function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('smartstay_access_token', accessToken)
  if (refreshToken) localStorage.setItem('smartstay_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('smartstay_access_token')
  localStorage.removeItem('smartstay_refresh_token')
  localStorage.removeItem('smartstay_current_staff')
}

/**
 * Perform token refresh using stored refresh token
 */
async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${API_BASE_URL}/staff/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  const json = await response.json()
  if (!response.ok || !json.success) {
    clearTokens()
    window.dispatchEvent(new CustomEvent('smartstay:unauthorized'))
    throw new Error(json.message || 'Session expired. Please log in again.')
  }

  const { accessToken: newAccess, refreshToken: newRefresh, staff } = json.data
  setTokens(newAccess, newRefresh)
  if (staff) {
    localStorage.setItem('smartstay_current_staff', JSON.stringify(staff))
  }
  return newAccess
}

/**
 * Universal request wrapper
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    params = null,
    isBlob = false,
    skipAuth = false,
  } = options

  // Build full query string if params supplied
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val)
      }
    })
    const qs = query.toString()
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs
    }
  }

  const reqHeaders = { ...headers }
  if (body && !(body instanceof FormData) && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  const token = getAccessToken()
  if (!skipAuth && token && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Bearer ${token}`
  }

  const fetchOptions = {
    method,
    headers: reqHeaders,
    body: body instanceof FormData || typeof body === 'string' || body === null
      ? body
      : JSON.stringify(body),
  }

  try {
    let response = await fetch(url, fetchOptions)

    // Handle token expiration & retry automatically
    if (response.status === 401 && !skipAuth && getRefreshToken() && !endpoint.includes('/staff/login') && !endpoint.includes('/staff/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await refreshAccessToken()
          isRefreshing = false
          onRefreshed(newToken)
        } catch (refreshErr) {
          isRefreshing = false
          refreshSubscribers = []
          throw refreshErr
        }
      }

      // Re-try once refreshed
      const retryToken = await new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => resolve(newToken))
      })

      fetchOptions.headers['Authorization'] = `Bearer ${retryToken}`
      response = await fetch(url, fetchOptions)
    }

    if (isBlob) {
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}))
        const err = new Error(errorJson.message || `Request failed with status ${response.status}`)
        err.status = response.status
        err.code = errorJson.code
        throw err
      }
      return await response.blob()
    }

    const json = await response.json().catch(() => ({}))

    if (!response.ok || json.success === false) {
      const err = new Error(json.message || `HTTP ${response.status}: Action failed`)
      err.status = response.status
      err.code = json.code
      err.details = json.details
      throw err
    }

    return json.data !== undefined ? json.data : json
  } catch (err) {
    console.error(`[API Error] ${method} ${url}:`, err.message)
    throw err
  }
}

export const api = {
  get: (url, params, options = {}) => request(url, { method: 'GET', params, ...options }),
  post: (url, body, options = {}) => request(url, { method: 'POST', body, ...options }),
  patch: (url, body, options = {}) => request(url, { method: 'PATCH', body, ...options }),
  put: (url, body, options = {}) => request(url, { method: 'PUT', body, ...options }),
  delete: (url, body, options = {}) => request(url, { method: 'DELETE', body, ...options }),
  downloadBlob: (url, params) => request(url, { method: 'GET', params, isBlob: true }),
}

export default api
