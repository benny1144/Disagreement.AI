import React from 'react'
import ContactForm from '../components/ContactForm'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Us</h1>
          <p className="mt-2 text-slate-600 text-lg">Have a question, feedback, or partnership inquiry? Send us a message and we’ll get back to you.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
