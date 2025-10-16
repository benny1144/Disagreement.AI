import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

export default function UserAccountPage() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  // Danger Zone modal state
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [confirmPhrase, setConfirmPhrase] = useState('')
  const canConfirmDelete = confirmPhrase === 'DELETE'

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess('')

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSaveError('Please fill out all fields')
      return
    }
    if (newPassword.length < 8) {
      setSaveError('New password must be at least 8 characters long')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setSaveError('New password and confirmation do not match')
      return
    }
    if (!token) {
      setSaveError('Not authenticated')
      return
    }

    try {
      setSaving(true)
      await axios.put(
        `${API_URL}/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSaveSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update password'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!canConfirmDelete || !token) return
    try {
      await axios.delete(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      // Log out locally and redirect
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      // Keep modal open but show an inline error in place of success
      alert(err?.response?.data?.message || err?.message || 'Failed to delete account')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Your Account</h1>

          {/* Profile Information */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Profile Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-lg text-slate-700"
                />
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Change Password</h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              {saveError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">{saveError}</div>
              )}
              {saveSuccess && (
                <div className="rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2">{saveSuccess}</div>
              )}
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 disabled:opacity-60 px-4 py-2 text-lg"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="mt-10">
            <div className="border border-red-500 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-600 mb-3">Danger Zone</h2>
              <p className="text-slate-600 mb-4">Deleting your account is permanent and cannot be undone.</p>
              <button
                onClick={() => { setDeleteOpen(true); setConfirmPhrase('') }}
                className="inline-flex items-center rounded-md bg-red-600 text-white font-semibold shadow-sm hover:bg-red-500 px-4 py-2 text-lg"
              >
                Delete My Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirm Account Deletion</h3>
            <p className="text-slate-700 mb-4">This action is permanent and cannot be undone. To proceed, type <span className="font-semibold">DELETE</span> below.</p>
            <input
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!canConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold shadow-sm hover:bg-red-500 disabled:opacity-60"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}