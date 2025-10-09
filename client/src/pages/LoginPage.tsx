import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../features/auth/authService.js'

export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const { email, password } = formData

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await authService.login(formData)
      if (user) {
        navigate('/dashboard')
      }
    } catch (error: any) {
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        (error && error.message) ||
        error?.toString()
      if (typeof window !== 'undefined') {
        window.alert(`Login Failed: ${message}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-slate-800">Log In to Your Account</h1>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="block text-slate-600 font-medium">Email address</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
          </label>

          <label className="block">
            <span className="block text-slate-600 font-medium">Password</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log In
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
