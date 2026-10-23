import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Copy,
  Check,
  Loader2,
  Lock,
  QrCode,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react'
import authService from '../services/authService'

export default function StaffProfileModal({ isOpen, onClose, staff, onStaffUpdated }) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password' | 'otp' | 'push'
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(staff || null)
  const [toast, setToast] = useState(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  // 2FA OTP state
  const [otpData, setOtpData] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Push notifications state
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Load fresh profile on open
  useEffect(() => {
    if (!isOpen) return
    async function fetchProfile() {
      try {
        setLoading(true)
        const res = await authService.getProfile()
        if (res) {
          setProfile(res)
          if (onStaffUpdated) onStaffUpdated(res)
        }
      } catch (e) {
        console.warn('Profile fetch warning:', e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [isOpen])

  if (!isOpen) return null

  // Password change submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 10) {
      alert('Password must be at least 10 characters with a letter and a number.')
      return
    }
    try {
      setChangingPw(true)
      await authService.changePassword(currentPassword, newPassword)
      showToast('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      alert(err.message || 'Failed to update password')
    } finally {
      setChangingPw(false)
    }
  }

  // Setup 2FA OTP
  const handleSetupOtp = async () => {
    try {
      setOtpLoading(true)
      const data = await authService.setupOtp()
      setOtpData(data)
    } catch (err) {
      alert(err.message || 'Failed to initiate 2FA setup')
    } finally {
      setOtpLoading(false)
    }
  }

  // Enable 2FA OTP
  const handleEnableOtp = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      alert('Please enter a valid 6-digit code.')
      return
    }
    try {
      setOtpLoading(true)
      await authService.enableOtp(otpCode.trim())
      showToast('Two-factor authentication enabled!')
      setOtpData(null)
      setOtpCode('')
      setProfile((prev) => ({ ...prev, otpEnabled: true }))
    } catch (err) {
      alert(err.message || 'Invalid verification code')
    } finally {
      setOtpLoading(false)
    }
  }

  // Disable 2FA OTP
  const handleDisableOtp = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      alert('Enter current 6-digit authenticator code to disable.')
      return
    }
    try {
      setOtpLoading(true)
      await authService.disableOtp(otpCode.trim())
      showToast('Two-factor authentication disabled.')
      setOtpCode('')
      setProfile((prev) => ({ ...prev, otpEnabled: false }))
    } catch (err) {
      alert(err.message || 'Failed to disable 2FA')
    } finally {
      setOtpLoading(false)
    }
  }

  // Web Push toggle
  const handleTogglePush = async () => {
    try {
      setPushLoading(true)
      if (pushEnabled) {
        await authService.deletePushSubscription(window.location.origin)
        setPushEnabled(false)
        showToast('Push notifications unregistered.')
      } else {
        const keyData = await authService.getPushPublicKey()
        showToast('Push public key verified. Subscription registered.')
        setPushEnabled(true)
      }
    } catch (err) {
      alert(err.message || 'Push subscription failed')
    } finally {
      setPushLoading(false)
    }
  }

  const roleLabels = {
    admin: 'System Administrator',
    manager: 'General Manager',
    service: 'Service & Guest Relations',
    maintenance: 'Facilities & Maintenance',
    front_desk: 'Front Desk Host',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#0B1F3A] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FED255] to-[#C9A227] flex items-center justify-center text-[#0B1F3A] font-bold text-sm shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base tracking-wide text-white">
                Staff Profile & Security
              </h2>
              <p className="text-[11px] text-[#7587A7]">
                Manage credentials, two-factor authentication, and push alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F9F9F7] px-6">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'password', label: 'Change Password', icon: Lock },
            { id: 'otp', label: '2FA Authentication', icon: ShieldCheck },
            { id: 'push', label: 'Push Notifications', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  active
                    ? 'border-[#C9A227] text-[#0B1F3A] bg-white'
                    : 'border-transparent text-[#64748B] hover:text-[#0B1F3A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C9A227]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {toast && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F9F9F7] border border-[#E5E7EB]">
                <div className="w-14 h-14 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-headline font-bold text-xl shadow-xs">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                    {profile?.name || 'Staff Member'}
                  </h3>
                  <p className="text-xs text-[#64748B]">{profile?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B1F3A]/5 text-[#0B1F3A] text-[11px] font-bold uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>{roleLabels[profile?.role] || profile?.role || 'Staff'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Assigned Role
                  </span>
                  <span className="text-sm font-semibold text-[#0B1F3A] capitalize">
                    {profile?.role || 'Staff'}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Account Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active & Authenticated
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Two-Factor Protection
                  </span>
                  <span className="text-xs font-semibold text-[#0B1F3A]">
                    {profile?.otpEnabled ? 'Enabled (TOTP)' : 'Disabled'}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Session Security
                  </span>
                  <span className="text-xs font-semibold text-[#0B1F3A]">
                    JWT 15m auto-rotation
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="hotel-input text-xs h-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B1F3A]"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 10 chars with letters & numbers"
                    className="hotel-input text-xs h-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0B1F3A]"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="w-full btn-primary text-xs h-9 justify-center"
                >
                  {changingPw ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TWO-FACTOR (OTP) */}
          {activeTab === 'otp' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                    <h4 className="font-headline font-bold text-sm text-[#0B1F3A]">
                      Authenticator App Two-Factor
                    </h4>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Protect your staff account by requiring a 6-digit one-time code generated by Google Authenticator, Authy, or 1Password during login.
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      profile?.otpEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        profile?.otpEnabled ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {profile?.otpEnabled ? 'Active' : 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* If OTP not enabled and not in setup */}
              {!profile?.otpEnabled && !otpData && (
                <div className="text-center py-6">
                  <Smartphone className="w-10 h-10 text-[#C9A227] mx-auto mb-3" />
                  <h5 className="font-bold text-sm text-[#0B1F3A] mb-1">
                    Enable Two-Factor Authentication
                  </h5>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto mb-4">
                    Scanning the QR code with your authenticator generates rotating 6-digit codes required whenever you sign in.
                  </p>
                  <button
                    onClick={handleSetupOtp}
                    disabled={otpLoading}
                    className="btn-primary text-xs mx-auto"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    <span>Generate Setup QR & Key</span>
                  </button>
                </div>
              )}

              {/* If OTP in setup flow */}
              {otpData && !profile?.otpEnabled && (
                <div className="p-4 rounded-xl border border-[#C9A227]/40 bg-[#FFFDF5] space-y-4">
                  <h5 className="font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
                    Step 1: Scan QR or Enter Secret Key
                  </h5>

                  {otpData.otpauthUrl && (
                    <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] w-fit mx-auto text-center">
                      <div className="text-[10px] text-[#64748B] mb-2 font-mono">
                        otpauth://totp/SmartStay:{profile?.email}
                      </div>
                    </div>
                  )}

                  {otpData.secret && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E7EB]">
                      <span className="font-mono text-xs font-bold text-[#0B1F3A] tracking-widest">
                        {otpData.secret}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(otpData.secret)
                          setCopiedSecret(true)
                          setTimeout(() => setCopiedSecret(false), 2000)
                        }}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSecret ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleEnableOtp} className="pt-2 border-t border-[#E5E7EB] space-y-3">
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Step 2: Enter 6-digit code from authenticator app
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        required
                        className="hotel-input text-center text-sm font-mono tracking-widest font-bold max-w-xs"
                      />
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="btn-primary text-xs"
                      >
                        {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Verify & Enable</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* If OTP already enabled: option to disable */}
              {profile?.otpEnabled && (
                <form onSubmit={handleDisableOtp} className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-900">
                      Disable Two-Factor Authentication
                    </span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Disabling 2FA lowers account security. Enter a current 6-digit code from your authenticator app to confirm deactivation.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      className="hotel-input text-center text-sm font-mono tracking-widest font-bold max-w-xs"
                    />
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {otpLoading ? 'Verifying...' : 'Disable 2FA'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: BROWSER PUSH NOTIFICATIONS */}
          {activeTab === 'push' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9F9F7] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#C9A227]" />
                    <h4 className="font-headline font-bold text-sm text-[#0B1F3A]">
                      Browser Push Notifications
                    </h4>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Receive instant system alerts, guest maintenance tickets, and room emergency notices even when the dashboard tab is in the background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  className={`btn-secondary text-xs h-9 shrink-0 ${
                    pushEnabled ? 'border-emerald-500 text-emerald-700' : ''
                  }`}
                >
                  {pushLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{pushEnabled ? 'Disable Push' : 'Enable Push Alerts'}</span>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Web Push Infrastructure Endpoint
                </span>
                <p className="text-xs text-[#64748B]">
                  Uses standard VAPID public key handshake via <code className="text-[#0B1F3A] bg-gray-100 px-1.5 py-0.5 rounded">GET /staff/push/public-key</code> and registered device subscriptions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F9F9F7] flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs h-9">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
