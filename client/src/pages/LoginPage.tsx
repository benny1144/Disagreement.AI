import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const { email, password } = formData

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

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
          <Link to="/register" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
