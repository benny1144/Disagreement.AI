import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import authService from '../features/auth/authService.js'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

export default function SignUpPage(): JSX.Element {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { name, email, password, password2 } = formData

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setSubmitError('')
    setIsSubmitting(true)
    console.log('Sign up attempt...', { name, email })

    if (password !== password2) {
      setIsSubmitting(false)
      setSubmitError('Passwords do not match.')
      return
    }

    try {
      const userData = { name, email, password }
      const user = await authService.register(userData)
      if (user) {
        console.log('Registration successful!')
        try { localStorage.setItem('user', JSON.stringify(user)) } catch (_) {}
        // If coming from an invite, auto-accept and redirect to chat
        try {
          const fromInvite = (location.state as any)?.fromInvite
          const authToken = (user as any)?.token || (JSON.parse(localStorage.getItem('user') || 'null')?.token)
          if (fromInvite && authToken) {
            const res = await axios.post(
              `${API_URL}/disagreements/invite/${fromInvite}`,
              {},
              { headers: { Authorization: `Bearer ${authToken}` } }
            )
            const { disagreementId, code } = (res.data as any) || {}
            if (res.status === 202 || code === 'PENDING_APPROVAL') {
              // Pending approval — send back to invite page
              navigate(`/invite/${fromInvite}`)
              return
            }
            if (disagreementId) {
              navigate(`/disagreement/${disagreementId}`)
              return
            }
          }
        } catch (autoErr) {
          console.error('Auto-accept invite after signup failed:', autoErr)
        }
        // Default: go to dashboard
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        (error && error.message) ||
        error?.toString()
      setSubmitError(message || 'Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <form onSubmit={handleSignUp} className="w-full max-w-md border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
        <p className="text-lg text-slate-600 mt-1">Start resolving disagreements with a calm, clear workflow.</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="block text-slate-700 font-semibold">Name</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Your name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="block text-slate-700 font-semibold">Email address</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="block text-slate-700 font-semibold">Password</span>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-300 pr-10 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.07 1.12-2.06 1.94-2.94M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-3.42"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="block text-slate-700 font-semibold">Confirm password</span>
            <div className="mt-1 relative">
              <input
                type={showPassword2 ? 'text' : 'password'}
                name="password2"
                value={password2}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-slate-300 pr-10 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(v => !v)}
                aria-label={showPassword2 ? 'Hide password confirmation' : 'Show password confirmation'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
              >
                {showPassword2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.07 1.12-2.06 1.94-2.94M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-3.42"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-6 w-full font-semibold rounded-md shadow-sm transition-colors py-2 text-lg ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
          {isSubmitting ? 'Signing up…' : 'Sign Up'}
        </button>
        {submitError && (
          <p className="mt-3 text-center text-red-600 text-sm">{submitError}</p>
        )}
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  )
}
