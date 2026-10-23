import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import { getAccessToken, clearTokens } from '../services/apiClient'
import { initSocket, disconnectSocket } from '../services/socket'

const AuthContext = createContext(null)

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@smartstay.local',
    password: 'ChangeMe123!',
    label: 'System Admin',
    role: 'admin',
  },
  manager: {
    email: 'manager@smartstay.local',
    password: 'Password123!',
    label: 'Operations Manager',
    role: 'manager',
  },
  service: {
    email: 'service@smartstay.local',
    password: 'Password123!',
    label: 'Guest Service Lead',
    role: 'service',
  },
  maintenance: {
    email: 'maintenance@smartstay.local',
    password: 'Password123!',
    label: 'Chief Technician',
    role: 'maintenance',
  },
  front_desk: {
    email: 'frontdesk@smartstay.local',
    password: 'Password123!',
    label: 'Front Desk Host',
    role: 'front_desk',
  },
}

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(() => {
    try {
      const stored = localStorage.getItem('smartstay_current_staff')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)

  // Listen for socket connection status
  useEffect(() => {
    const handleSocketStatus = (e) => {
      setSocketConnected(!!e.detail?.connected)
    }
    const handleUnauthorized = () => {
      setStaff(null)
      disconnectSocket()
    }

    window.addEventListener('smartstay:socket-status', handleSocketStatus)
    window.addEventListener('smartstay:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('smartstay:socket-status', handleSocketStatus)
      window.removeEventListener('smartstay:unauthorized', handleUnauthorized)
    }
  }, [])

  // Verify session on mount
  useEffect(() => {
    async function verifySession() {
      const token = getAccessToken()
      if (!token) {
        setStaff(null)
        setLoading(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        setStaff(profile)
        localStorage.setItem('smartstay_current_staff', JSON.stringify(profile))
        initSocket()
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message)
        clearTokens()
        setStaff(null)
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const login = async (email, password, otp) => {
    const res = await authService.login(email, password, otp)
    setStaff(res.staff)
    return res
  }

  const loginAsDemoRole = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey]
    if (!creds) throw new Error(`Unknown demo role: ${roleKey}`)
    return await login(creds.email, creds.password)
  }

  const logout = async () => {
    await authService.logout()
    setStaff(null)
  }

  const value = {
    staff,
    isAuthenticated: Boolean(staff && getAccessToken()),
    role: staff?.role || 'guest',
    loading,
    socketConnected,
    login,
    loginAsDemoRole,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
