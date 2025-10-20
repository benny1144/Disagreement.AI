import React, { useMemo, useState } from 'react'
import axios from 'axios'

/**
 * ProposalMessage
 * Renders an AI proposal card with distinct styling and Agree/Disagree buttons.
 * Props:
 * - message: { _id?: string, text: string, sender?: { name?: string }, isProposal?: boolean, agreements?: Array<{ user: any, agreedAt?: string }> }
 * - disagreementId: string
 */
export default function ProposalMessage({ message, disagreementId }) {
  const text = (message?.text || '').toString()
  const senderName = (message?.sender && message.sender.name) ? message.sender.name : 'DAI'

  const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : ''
  const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

  // Resolve current user id from localStorage (consistent with other components)
  const currentUserId = useMemo(() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return null
      const u = JSON.parse(stored)
      return u?._id || u?.id || u?.userId || null
    } catch { return null }
  }, [])

  const alreadyAgreed = useMemo(() => {
    const arr = Array.isArray(message?.agreements) ? message.agreements : []
    return arr.some((a) => {
      const uid = typeof a?.user === 'object' ? (a.user?._id || a.user?.id) : a?.user
      return currentUserId && uid && String(uid) === String(currentUserId)
    })
  }, [message, currentUserId])

  const [agreeDisabled, setAgreeDisabled] = useState(Boolean(alreadyAgreed))
  const [disagreeDisabled, setDisagreeDisabled] = useState(false)
  const [agreeError, setAgreeError] = useState('')

  const handleAgree = async () => {
    if (!message?._id || !disagreementId) return
    setAgreeError('')
    setAgreeDisabled(true)
    // Read token
    let token
    try { token = JSON.parse(localStorage.getItem('user'))?.token } catch { token = undefined }
    try {
      await axios.post(
        `${API_URL}/disagreements/${disagreementId}/proposals/${message._id}/vote`,
        { vote: 'agree' },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      // Optimistic UI is optional; real-time update will refresh the agreements list via socket
    } catch (err) {
      setAgreeError(err?.response?.data?.message || err?.message || 'Failed to record your agreement.')
      // Re-enable button to allow retry
      setAgreeDisabled(false)
    }
  }

  const handleDisagree = () => {
    console.log('User disagreed with proposal', { messageId: message?._id })
    setDisagreeDisabled(true)
  }

  const agreedNames = useMemo(() => {
    const arr = Array.isArray(message?.agreements) ? message.agreements : []
    const names = arr.map((a) => {
      const user = a?.user
      const id = typeof user === 'object' ? (user?._id || user?.id) : user
      const name = typeof user === 'object' ? (user?.name || '') : ''
      if (currentUserId && id && String(id) === String(currentUserId)) return 'You'
      return name || 'Participant'
    })
    // Deduplicate names for display
    return Array.from(new Set(names))
  }, [message, currentUserId])

  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-[85%] lg:w-[70%] border border-emerald-200 bg-emerald-50 rounded-xl shadow-sm p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm select-none" aria-hidden>
            ♟️
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-emerald-800">{senderName}</span>
              <span className="text-xs uppercase tracking-wide text-emerald-700/80 font-semibold">Resolution Proposal</span>
            </div>
            <p className="mt-2 text-slate-900 leading-relaxed">
              {text}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm ${agreeDisabled ? 'bg-emerald-300 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                aria-label="I agree with this proposal"
                onClick={handleAgree}
                disabled={agreeDisabled}
              >
                I Agree
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-800 bg-white text-sm font-semibold ${disagreeDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                aria-label="I disagree with this proposal"
                onClick={handleDisagree}
                disabled={disagreeDisabled}
              >
                I Disagree
              </button>
            </div>
            {agreeError && (
              <p className="mt-2 text-sm text-red-600">{agreeError}</p>
            )}
            {agreedNames.length > 0 && (
              <div className="mt-3 text-sm text-emerald-900">
                <span className="font-semibold">Agreed:</span>{' '}
                <span>{agreedNames.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
