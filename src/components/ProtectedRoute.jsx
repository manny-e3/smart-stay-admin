import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center shadow-md mb-4 animate-pulse">
          <Home className="w-6 h-6 text-[#FED255] stroke-[2.2]" />
        </div>
        <div className="font-headline font-bold text-lg text-[#0B1F3A]">
          SmartStay Hospitality Core
        </div>
        <p className="text-xs text-[#64748B] mt-1">
          Authenticating secure staff session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors to login, preserving attempted route
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
