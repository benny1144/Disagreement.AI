import React, { useState } from 'react'
import axios from 'axios'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setError('')
    setSuccess('')

    const name = String(form.name || '').trim()
    const email = String(form.email || '').trim()
    const message = String(form.message || '').trim()

    if (!name || !email || !message) {
      setError('Please fill out all fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { name, fullName: name, email, message }
      const res = await axios.post(`${API_URL}/contact`, payload)
      if (res && (res.status === 200 || res.status === 202)) {
        setSuccess('Thank you! Your message has been sent.')
        setForm({ name: '', email: '', message: '' })
      } else {
        setError('Submission failed. Please try again.')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-slate-700 font-semibold">Your Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Jane Doe"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-slate-700 font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-slate-700 font-semibold">Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          placeholder="How can we help?"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full font-semibold rounded-md shadow-sm transition-colors py-2 text-lg ${isSubmitting ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>

      {error && <p className="text-center text-red-600 text-sm">{error}</p>}
      {success && <p className="text-center text-green-600 text-sm">{success}</p>}
    </form>
  )
}
