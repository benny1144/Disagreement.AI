import React from 'react'
import { Link } from 'react-router-dom'
import ContactForm from '../components/ContactForm.jsx'

export default function InAppContactPage() {
  return (
    <div className="min-h-[60vh] bg-white font-sans px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Support</h1>
          <p className="mt-2 text-slate-600 text-lg">Have a question about your account or a disagreement? Send us a message and our team will get back to you.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
