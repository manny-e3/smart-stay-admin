import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Shield,
  KeyRound,
  Unlock,
  Check,
  X,
  Loader2,
  RefreshCw,
  Edit2,
  UserX,
  UserCheck,
  Lock,
  Mail,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import staffService from '../services/staffService'

export default function StaffAccountsView() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [resetPwStaff, setResetPwStaff] = useState(null)
  const [tempPassword, setTempPassword] = useState('Welcome12345')

  // Create Form State
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('service')
  const [newPassword, setNewPassword] = useState('Welcome12345')
  const [creating, setCreating] = useState(false)

  // Edit Form State
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('service')
  const [updating, setUpdating] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadStaff = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const params = { limit: 50 }
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.active = statusFilter === 'active'
      if (searchQuery.trim()) params.q = searchQuery.trim()

      const res = await staffService.listStaff(params)
      setStaffList(res?.items || (Array.isArray(res) ? res : []))
    } catch (err) {
      console.warn('Failed to load staff accounts:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [roleFilter, statusFilter, searchQuery])

  // Create Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (newPassword.length < 10) {
      alert('Password must be at least 10 characters with a letter and a number.')
      return
    }
    try {
      setCreating(true)
      await staffService.createStaff({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        password: newPassword,
      })
      showToast(`Staff member "${newName}" registered successfully.`)
      setIsCreateModalOpen(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('Welcome12345')
      loadStaff(true)
    } catch (err) {
      alert(err.message || 'Failed to create staff account')
    } finally {
      setCreating(false)
    }
  }

  // Update Staff Details
  const handleUpdateStaff = async (e) => {
    e.preventDefault()
    if (!editingStaff) return
    try {
      setUpdating(true)
      await staffService.updateStaff(editingStaff.id, {
        name: editName.trim(),
        role: editRole,
      })
      showToast(`Staff profile "${editName}" updated.`)
      setEditingStaff(null)
      loadStaff(true)
    } catch (err) {
      alert(err.message || 'Failed to update staff')
    } finally {
      setUpdating(false)
    }
  }

  // Toggle Active / Inactive
  const handleToggleActive = async (staff) => {
    const targetState = !staff.isActive
    try {
      await staffService.updateStaff(staff.id, { isActive: targetState })
      showToast(`Account "${staff.name}" ${targetState ? 'reactivated' : 'deactivated'}.`)
      loadStaff(true)
    } catch (err) {
      alert(err.message || 'Failed to toggle account status')
    }
  }

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPwStaff) return
    try {
      await staffService.resetPassword(resetPwStaff.id, tempPassword)
      showToast(`Temporary password assigned for ${resetPwStaff.name}.`)
      setResetPwStaff(null)
      setTempPassword('Welcome12345')
    } catch (err) {
      alert(err.message || 'Failed to reset password')
    }
  }

  // Unlock Account & Reset 2FA OTP
  const handleUnlockAndResetOtp = async (staff) => {
    if (!confirm(`Unlock account and clear 2FA authenticator for "${staff.name}"?`)) return
    try {
      await staffService.unlockOrResetOtp(staff.id, { unlock: true, resetOtp: true })
      showToast(`Account unlocked and 2FA reset for ${staff.name}.`)
      loadStaff(true)
    } catch (err) {
      alert(err.message || 'Failed to unlock staff account')
    }
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    service: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
    front_desk: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1F3A] text-white shadow-xl border border-white/10 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            ACCESS CONTROL & SECURITY GOVERNANCE
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Staff Accounts & RBAC
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage operational user credentials, role-based authorizations, two-factor resets, and account access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStaff(true)}
            disabled={refreshing}
            className="btn-secondary text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Member</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="hotel-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#64748B]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="service">Service</option>
              <option value="maintenance">Maintenance</option>
              <option value="front_desk">Front Desk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#64748B]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="hotel-input text-xs h-8 pl-8"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="hotel-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
            Loading staff directory...
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
              No Staff Accounts Found
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Adjust your search filter or register a new staff member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9F9F7] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Security / 2FA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F9F9F7]/60 transition-colors">
                    {/* Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-xs">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-[#0B1F3A] block">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          roleColors[member.role] || 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{member.role}</span>
                      </span>
                    </td>

                    {/* Security 2FA */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {member.otpEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>2FA Enforced</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">Standard Password</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {member.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Role/Name */}
                        <button
                          onClick={() => {
                            setEditingStaff(member)
                            setEditName(member.name)
                            setEditRole(member.role)
                          }}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                          title="Edit Staff Info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setResetPwStaff(member)
                            setTempPassword('Welcome12345')
                          }}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F4F2] text-[#64748B] hover:text-[#0B1F3A] transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Unlock / Reset 2FA */}
                        <button
                          onClick={() => handleUnlockAndResetOtp(member)}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-amber-50 text-[#64748B] hover:text-amber-700 transition-colors cursor-pointer"
                          title="Unlock Account & Reset 2FA OTP"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                        </button>

                        {/* Deactivate / Reactivate Toggle */}
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            member.isActive !== false
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={member.isActive !== false ? 'Deactivate Account' : 'Reactivate Account'}
                        >
                          {member.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE STAFF MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#0B1F3A] text-white">
              <h3 className="font-headline font-bold text-base text-white">
                Create Staff Account
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Michael Thorne"
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="e.g. michael@smartstay.local"
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Role Authorization *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="hotel-input text-xs h-9"
                >
                  <option value="service">Service (Guest Requests & Amenities)</option>
                  <option value="maintenance">Maintenance (Alerts & Telemetry)</option>
                  <option value="front_desk">Front Desk (Check-ins & Keys)</option>
                  <option value="manager">Manager (Audits & Energy Analytics)</option>
                  <option value="admin">Admin (Full System Privileges)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Temporary Password *
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 10 chars with letters & numbers"
                  className="hotel-input text-xs h-9"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Password must be 10+ characters with letters and numbers.
                </span>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary text-xs h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs h-9"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#0B1F3A] text-white">
              <h3 className="font-headline font-bold text-base text-white">
                Edit Staff: {editingStaff.email}
              </h3>
              <button onClick={() => setEditingStaff(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="hotel-input text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="hotel-input text-xs h-9"
                >
                  <option value="service">Service</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="btn-secondary text-xs h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary text-xs h-9"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPwStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-headline font-bold text-sm text-[#0B1F3A]">
                Reset Staff Password
              </h3>
              <button onClick={() => setResetPwStaff(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-[#64748B]">
                Enter a temporary password for <strong>{resetPwStaff.name}</strong> ({resetPwStaff.email}).
              </p>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1.5">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  placeholder="TempPassword123"
                  className="hotel-input text-xs h-9 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPwStaff(null)}
                  className="btn-secondary text-xs h-8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs h-8"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
