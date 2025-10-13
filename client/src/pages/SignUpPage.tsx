import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../features/auth/authService.js'

export default function SignUpPage(): JSX.Element {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' })
  const navigate = useNavigate()

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
      if (typeof window !== 'undefined') {
        window.alert('Registration Failed: Passwords do not match.')
      }
      return
    }

    try {
      const userData = { name, email, password }
      const user = await authService.register(userData)
      if (user) {
        console.log('Registration successful!')
        if (typeof window !== 'undefined') {
          window.alert('Account Created: You have been successfully registered.')
        }
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        (error && error.message) ||
        error?.toString()
      setSubmitError(message || 'Network error. Please try again later.')
      if (typeof window !== 'undefined') {
        window.alert(`Registration Failed: ${message}`)
      }
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

          <label className="block">
            <span className="block text-slate-700 font-semibold">Confirm password</span>
            <input
              type="password"
              name="password2"
              value={password2}
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
          {isSubmitting ? 'Signing up…' : 'Sign Up'}
        </button>
        {submitError && (
          <p className="mt-3 text-center text-red-600 text-sm">{submitError}</p>
        )}
      </form>
    </div>
  )
}
