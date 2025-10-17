import React, { useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

/*
  InvitationManager
  -----------------
  Purpose: Present a clear UI for a disagreement creator to manage
  active participants and pending invitations, and to re-open the
  invite flow.

  Notes:
  - Approve/Deny buttons are wired to console.log by default, but will
    call provided callbacks if present.
  - Layout uses Tailwind per project design system.
*/

/**
 * @typedef {Object} InvitationManagerProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {{_id?: string, participants?: any[], pendingInvitations?: any[]}} [disagreement]
 * @property {() => void} [onInviteNew]
 * @property {(email: string, raw?: any) => void} [onApproveInvite]
 * @property {(email: string, raw?: any) => void} [onDenyInvite]
 * @property {(updated: any) => void} [onUpdated]
 */

function getUserLabel(p) {
  if (!p) return 'Unknown User'
  if (typeof p === 'string') return p

  // Common shapes: { name, email }, { user: { name, email } }, or { user: string }
  const user = p.user ?? p
  if (typeof user === 'string') return user

  const name = user?.name || user?.fullName
  const email = user?.email
  return name || email || 'Unknown User'
}

function getInviteEmail(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  if (item.email) return item.email
  if (item.user) {
    if (typeof item.user === 'string') return item.user
    if (item.user?.email) return item.user.email
  }
  return ''
}

/**
 * @param {InvitationManagerProps} props
 */
export default function InvitationManager({
  isOpen,
  onClose,
  disagreement = {},
  onInviteNew,
  onApproveInvite,
  onDenyInvite,
  onUpdated,
}) {
  const dialogRef = useRef(null)

  // Control dialog visibility
  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    if (isOpen && !node.open) node.showModal()
    if (!isOpen && node.open) node.close()
  }, [isOpen])

  const participants = Array.isArray(disagreement?.participants) ? disagreement.participants : []
  const pending = Array.isArray(disagreement?.pendingInvitations) ? disagreement.pendingInvitations : []

  const { token } = useAuth()

  const getPendingUserId = (inv) => {
    if (!inv) return ''
    if (typeof inv === 'string') return inv
    if (inv?._id) return inv._id
    if (inv?.user) {
      if (typeof inv.user === 'string') return inv.user
      if (inv.user?._id) return inv.user._id
    }
    return ''
  }

  const handleApprove = async (inv) => {
    const email = getInviteEmail(inv)
    const userId = getPendingUserId(inv)
    if (!disagreement?._id || !userId) {
      if (onApproveInvite) onApproveInvite(email, inv)
      else console.log('Approve invitation for:', email || inv)
      return
    }

    try {
      const res = await axios.post(`${API_URL}/disagreements/${disagreement._id}/approve`, { userId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const updated = res?.data
      if (onUpdated && updated) onUpdated(updated)
    } catch (e) {
      console.error('Failed to approve invitation:', e?.response?.data?.message || e?.message || e)
    }
  }

  const handleDeny = (inv) => {
    const email = getInviteEmail(inv)
    if (onDenyInvite) onDenyInvite(email, inv)
    else console.log('Deny invitation for:', email || inv)
  }

  const handleInviteNew = () => {
    if (onInviteNew) onInviteNew()
    else console.log('Open InviteUserModal flow')
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} className="bg-transparent backdrop:bg-black/50 p-0 rounded-xl w-full max-w-xl">
      <div className="bg-white rounded-xl shadow-xl p-6 font-sans text-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Invitation Manager</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-light text-slate-500 hover:text-slate-800"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Section 1: Active Participants */}
        <section>
          <h3 className="text-lg font-bold text-slate-800">Active Participants</h3>
          {participants.length === 0 ? (
            <p className="mt-3 text-slate-500 text-sm">No active participants yet.</p>
          ) : (
            <ul className="mt-3 border border-slate-200 rounded-lg divide-y divide-slate-200">
              {participants.map((p, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3">
                  {/* User icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="text-slate-700 text-base">{getUserLabel(p)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr className="my-6"/>

        {/* Section 2: Pending Invitations */}
        <section>
          <h3 className="text-lg font-bold text-slate-800">Pending Invitations</h3>
          {pending.length === 0 ? (
            <p className="mt-3 text-slate-500 text-sm">There are no pending invitations.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pending.map((inv, idx) => {
                const email = getInviteEmail(inv)
                return (
                  <li key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {/* User icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-400"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span className="text-slate-700 text-base">{email || 'Pending user'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(inv)}
                        className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-semibold shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeny(inv)}
                        className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-sm"
                      >
                        Deny
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="mt-8 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleInviteNew}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="16" x2="22" y1="11" y2="11"/>
            </svg>
            Invite Someone New
          </button>
        </div>
      </div>
    </dialog>
  )
}
