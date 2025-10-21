import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const { email, password, rememberMe } = formData

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement).value
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setSubmitError('')
    setIsSubmitting(true)
    console.log(`Login attempt with email: ${email}`)
    try {
      const user = await login(formData)
      if (user) {
        console.log('Login successful!')
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        (error && error.message) ||
        error?.toString()
      setSubmitError(message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <form onSubmit={handleLogin} className="w-full max-w-md border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800">Log In to Your Account</h1>

        <div className="mt-6 space-y-4">
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
                tabIndex={0}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.07 1.12-2.06 1.94-2.94M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-3.42"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </label>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Stay logged in on this device.</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-6 w-full font-semibold rounded-md shadow-sm transition-colors py-2 text-lg ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
        {submitError && (
          <p className="mt-3 text-center text-red-600 text-sm">{submitError}</p>
        )}

        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
