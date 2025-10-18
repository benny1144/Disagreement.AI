import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

export default function InviteAcceptPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [details, setDetails] = useState({
    title: '',
    description: '',
    creatorName: '',
    customMessage: null,
  })

  // Fetch invite details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      if (!token) {
        setError('Invalid invitation link.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError('')
        const res = await axios.get(`${API_URL}/disagreements/invite/${token}`)
        const data = res.data || {}
        setDetails({
          title: data.title || 'Disagreement',
          description: data.description || '',
          creatorName: data.creatorName || 'Someone',
          customMessage: data.customMessage || null,
        })
      } catch (err) {
        const msg = (err && err.response && err.response.data && err.response.data.message) || err?.message || 'Invalid or expired invitation.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    void fetchDetails()
  }, [token])

  const isLoggedIn = (() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return false
      const u = JSON.parse(stored)
      return !!u?.token
    } catch {
      return false
    }
  })()

  const handleAcceptInvite = async () => {
    if (!token) return

    // If not logged in, redirect to Sign Up and carry the token in state
    if (!isLoggedIn) {
      navigate('/register', { state: { fromInvite: token } })
      return
    }

    let authToken
    try {
      authToken = JSON.parse(localStorage.getItem('user'))?.token
    } catch {
      authToken = undefined
    }
    if (!authToken) {
      navigate('/login')
      return
    }

    setAccepting(true)
    setError('')
    try {
      const res = await axios.post(
        `${API_URL}/disagreements/invite/${token}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      const { disagreementId, code } = res.data || {}

      if (res.status === 202 || code === 'PENDING_APPROVAL') {
        setSuccessMsg('Your participation in this disagreement is pending approval. You will receive an email when approved or you can check back here later.')
        return
      }

      setSuccessMsg('You have successfully accepted the invitation! Redirecting…')
      // Navigate to the chat page
      if (disagreementId) {
        navigate(`/disagreement/${disagreementId}`)
      }
    } catch (err) {
      const apiCode = err?.response?.data?.code
      if (apiCode === 'PENDING_APPROVAL') {
        setError('Your participation in this disagreement is pending approval. You will receive an email when approved or you can check back here later.')
      } else {
        const msg = (err && err.response && err.response.data && err.response.data.message) || err?.message || 'Failed to accept invitation.'
        setError(msg)
      }
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-lg">Loading invitation…</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold text-slate-800">Invitation Problem</h1>
              <p className="mt-3 text-red-600">{error || 'Invalid or expired invitation.'}</p>
              <div className="mt-6">
                <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">You're invited to join</h1>
                <h2 className="mt-2 text-xl md:text-2xl font-bold text-slate-800">{details.title}</h2>
                <p className="mt-1 text-slate-600">Created by {details.creatorName}</p>
              </header>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">About this disagreement</h3>
                  <p className="mt-1 text-slate-700 text-lg leading-relaxed">{details.description}</p>
                </div>

                {details.customMessage ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-600">Personal message from {details.creatorName}</h4>
                    <p className="mt-1 text-slate-700">{details.customMessage}</p>
                  </div>
                ) : null}
              </section>

              {successMsg && (
                <p className="mt-6 text-center text-green-600">{successMsg}</p>
              )}

              {!successMsg && (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAcceptInvite}
                    disabled={accepting}
                    className={`px-6 py-3 rounded-md text-white font-semibold text-lg shadow-sm ${accepting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                  >
                    {isLoggedIn ? (accepting ? 'Accepting…' : 'Accept Invitation') : 'Log In to Accept'}
                  </button>
                  {!isLoggedIn && (
                    <p className="text-sm text-slate-600">
                      New here?{' '}
                      <Link className="text-blue-600 hover:underline" to="/register">Create an account</Link>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
