import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  UserCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext'

export default function LoginScreen({ onLogin }) {
  const navigate = useNavigate()
  const { login, loginAsDemoRole } = useAuth()

  const [email, setEmail] = useState('admin@smartstay.local')
  const [password, setPassword] = useState('ChangeMe123!')
  const [otp, setOtp] = useState('')
  const [requiresOtp, setRequiresOtp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeDemoRole, setActiveDemoRole] = useState('admin')

  const handleSelectDemoRole = (roleKey) => {
    setActiveDemoRole(roleKey)
    const creds = DEMO_CREDENTIALS[roleKey]
    if (creds) {
      setEmail(creds.email)
      setPassword(creds.password)
      setRequiresOtp(false)
      setOtp('')
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login(email, password, requiresOtp ? otp : undefined)
      if (onLogin) {
        onLogin()
      } else {
        navigate('/rooms')
      }
    } catch (err) {
      if (err.code === 'OTP_REQUIRED') {
        setRequiresOtp(true)
        setErrorMessage('This account requires a 6-digit Authenticator code.')
      } else {
        setErrorMessage(err.message || 'Login failed. Please verify credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDemoLogin = async (roleKey) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setActiveDemoRole(roleKey)
    try {
      await loginAsDemoRole(roleKey)
      if (onLogin) {
        onLogin()
      } else {
        navigate('/rooms')
      }
    } catch (err) {
      setErrorMessage(err.message || `Failed to sign in as ${roleKey}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-between items-center px-4 py-8 antialiased selection:bg-[#FED255] selection:text-[#0B1F3A]">
      <div />

      {/* Center Login Card matching Screen 1 */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 sm:p-10 shadow-[0_2px_12px_-2px_rgba(11,31,58,0.06),0_1px_4px_-1px_rgba(11,31,58,0.02)] border border-[#E5E7EB]/80 transition-all">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center shadow-md mb-4">
            <Home className="w-6 h-6 text-[#FED255] stroke-[2.2]" />
          </div>

          <h1 className="font-headline font-bold text-xl text-[#0B1F3A] tracking-tight">
            SmartStay
          </h1>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#64748B] uppercase mt-0.5">
            HOSPITALITY CORE • STAFF API
          </p>
        </div>

        {/* Section Title */}
        <div className="mt-6 mb-4 text-center">
          <h2 className="font-headline font-bold text-lg text-[#0B1F3A]">
            Staff Console Login
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Role-Based Access Control • Postman Collection Aligned
          </p>
        </div>

        {/* Demo Role Selector Pills */}
        {/* <div className="mb-6 p-2 rounded-xl bg-[#F4F4F2] border border-[#E5E7EB]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7587A7] mb-2 px-1 flex items-center justify-between">
            <span>Demo Seeding Roles (Release 1 & 2):</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Backend
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.entries(DEMO_CREDENTIALS).map(([key, info]) => {
              const active = activeDemoRole === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectDemoRole(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B1F3A] text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-[#1A1C1B] border border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-[11px] truncate leading-tight">
                    {info.label}
                  </div>
                  <div
                    className={`text-[9px] truncate ${
                      active ? 'text-[#FED255]' : 'text-gray-500'
                    }`}
                  >
                    {info.role}
                  </div>
                </button>
              )
            })}
          </div>
        </div> */}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#0B1F3A] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@smartstay.local"
                className="w-full h-11 px-3.5 rounded-lg bg-[#F4F4F2] border border-transparent text-sm text-[#0B1F3A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0B1F3A] focus:ring-3 focus:ring-[#0B1F3A]/8 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#0B1F3A]">
                Password
              </label>
              {/* <button
                type="button"
                onClick={() => alert('Default passwords:\n• Admin: ChangeMe123!\n• Staff: Password123!')}
                className="text-xs font-medium text-[#64748B] hover:text-[#0B1F3A] transition-colors"
              >
                View demo passwords
              </button> */}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-[#F4F4F2] border border-transparent text-sm text-[#0B1F3A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0B1F3A] focus:ring-3 focus:ring-[#0B1F3A]/8 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1F3A] p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2FA OTP Code Field (if enabled on account) */}
          {requiresOtp && (
            <div className="animate-fade-in pt-1">
              <label className="block text-xs font-semibold text-[#0B1F3A] mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>One-Time Code (2FA Authenticator)</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full h-11 px-3.5 tracking-widest text-center font-mono font-bold text-base rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#755B00] placeholder-amber-300 focus:bg-white focus:border-[#C9A227] focus:ring-3 focus:ring-[#C9A227]/20 outline-none transition-all"
              />
              <p className="text-[11px] text-[#64748B] mt-1 text-center">
                Enter the 6-digit code from Google Authenticator
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-[#755B00] hover:bg-[#604B00] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in as {DEMO_CREDENTIALS[activeDemoRole]?.label || 'Staff'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* 1-Click Fast Login Shortcut */}
        {/* <div className="mt-5 pt-4 border-t border-[#F1F5F9] text-center">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin(activeDemoRole)}
            disabled={isSubmitting}
            className="text-xs font-semibold text-[#0B1F3A] hover:text-[#C9A227] transition-colors cursor-pointer"
          >
            ⚡ Quick 1-Click Enter Console as {DEMO_CREDENTIALS[activeDemoRole]?.label}
          </button>
        </div> */}
      </div>

      {/* Footer */}
      <footer className="text-center py-4">
        <span className="text-[11px] font-bold text-[#64748B] tracking-widest uppercase">
          © SMARTSTAY HOSPITALITY CORE • RELEASE 1 & 2
        </span>
      </footer>
    </div>
  )
}
