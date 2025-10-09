import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
        if (typeof window !== 'undefined') {
          window.alert('Login Successful: Welcome back!')
        }
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <form onSubmit={onSubmit} className="w-full max-w-md border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800">Log In</h1>
        <p className="text-lg text-slate-600 mt-1">Welcome back. Please enter your details.</p>

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
          className="mt-6 w-full bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-500 transition-colors py-2 text-lg"
        >
          Log In
        </button>
      </form>
    </div>
  )
}
