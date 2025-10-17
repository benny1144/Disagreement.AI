import React, { useEffect, useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import CreateDisagreementModal from '../components/CreateDisagreementModal.jsx'
import InviteUserModal from '../components/InviteUserModal.jsx'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'

interface Disagreement {
  _id: string
  title: string
}

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [disagreements, setDisagreements] = useState<Disagreement[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [isInviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<{ id: string; token: string } | null>(null)

  const onOpen = () => setModalOpen(true)
  const onClose = () => setModalOpen(false)
  const { token, logout } = useAuth()


  // Fetch disagreements
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoading(false)
        setDisagreements([])
        return
      }
      try {
        setIsLoading(true)
        setError('')
        const res = await axios.get(`${API_URL}/disagreements`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDisagreements(Array.isArray(res.data) ? res.data : [])
      } catch (err: any) {
        const message =
          (err && err.response && err.response.data && err.response.data.message) ||
          err?.message ||
          'Failed to load disagreements'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const openInviteFor = (d: any) => {
    const id = (d && (d as any)._id) || ''
    const token = (d && (d as any)?.publicInviteToken?.token) || ''
    setInviteTarget({ id, token })
    setInviteModalOpen(true)
  }

  const closeInvite = () => {
    setInviteModalOpen(false)
    setInviteTarget(null)
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 py-6 md:py-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Your Dashboard</h1>
          <div className="flex items-center gap-4">
            <RouterLink to="/profile" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg">
              Profile
            </RouterLink>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow p-8 flex items-center justify-center min-h-[200px]">
            <span className="text-slate-500 text-lg">Loading…</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-red-600 font-semibold text-center">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(140px,auto)] gap-4 md:gap-6">
            {/* Active Disagreements (Bento 2x2) */}
            <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Active Disagreements</h2>
              {disagreements.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-600 py-10">
                  <div className="text-5xl" aria-hidden>📭</div>
                  <p className="text-lg mt-3 text-center">You have no active disagreements. Create one to get started!</p>
                  <button
                    onClick={onOpen}
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 px-5 py-2.5 text-lg"
                  >
                    Create New Disagreement
                  </button>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-1">
                  <ul className="space-y-3">
                    {disagreements.map((d) => (
                      <li key={d._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <RouterLink to={`/disagreement/${d._id}`} className="block">
                              <div className="text-base md:text-lg font-bold text-slate-800 truncate">{d.title || 'Untitled Disagreement'}</div>
                            </RouterLink>
                            <p className="text-xs text-slate-500 font-mono mt-1 break-all">ID: {(d as any)?._id}</p>
                            <div className="text-slate-600 mt-1 text-sm md:text-base">
                              {(() => {
                                const parts = (d as any)?.participants
                                if (Array.isArray(parts) && parts.length) {
                                  const names = parts.map((p: any) => (p?.user?.name || p?.name)).filter(Boolean)
                                  if (names.length) return `Participants: ${names.join(', ')}`
                                }
                                return 'Participants: You'
                              })()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openInviteFor(d)}
                            className="shrink-0 inline-flex items-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 px-3 py-1.5 text-sm md:text-base"
                          >
                            Invite
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA Card (Bento 1x1) */}
            <div className="lg:col-span-1 lg:row-span-1 bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all cursor-pointer" onClick={onOpen}>
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl" aria-hidden>+</div>
                <h3 className="text-xl font-bold text-slate-800">New Disagreement</h3>
                <p className="text-slate-600">Start a new resolution process.</p>
              </div>
            </div>

            {/* My Stats (Bento 1x1) */}
            <div className="lg:col-span-1 lg:row-span-1 bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">My Stats</h3>
              <div className="flex gap-8 flex-wrap">
                <div className="min-w-[140px]">
                  <div className="text-sm text-slate-600">Cases Resolved</div>
                  <div className="text-3xl font-bold text-slate-800">0</div>
                </div>
                <div className="min-w-[140px]">
                  <div className="text-sm text-slate-600">Success Rate</div>
                  <div className="text-3xl font-bold text-slate-800">N/A</div>
                </div>
              </div>
            </div>

            {/* Recent Activity (Bento 2x1) */}
            <div className="lg:col-span-2 lg:row-span-1 bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Recent Activity</h3>
              <p className="text-slate-600">Activity feed coming soon.</p>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateDisagreementModal
          isOpen={isModalOpen}
          onClose={onClose}
          onCreate={({ created }: any) => {
            if (created) setDisagreements((prev) => [created, ...prev])
          }}
        />
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={closeInvite}
          disagreementId={inviteTarget?.id}
          publicInviteToken={inviteTarget?.token || ''}
        />
      </div>
    </div>
  )
}
