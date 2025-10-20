import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import InviteUserModal from '../components/InviteUserModal'
import InvitationManager from '../components/InvitationManager'
import ProposalMessage from '../components/ProposalMessage'
import { useAuth } from '@/contexts/AuthContext'

// Derive API base from environment; fallback to same-origin relative /api
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'
// For Socket.IO, connect to the API base origin if provided; otherwise default to current origin
const SOCKET_BASE: string | undefined = API_BASE || undefined

interface Message {
  _id?: string
  sender?: any
  text: string
  isAIMessage?: boolean
  isProposal?: boolean
}

interface Participant {
  user?: any
  status?: 'active' | 'pending' | string
}

interface Disagreement {
  title?: string
  messages: Message[]
  publicInviteToken?: { token?: string; enabled?: boolean }
  participants?: Participant[]
  archivedAt?: string | Date | null
}

export default function ChatPage(): JSX.Element {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [disagreement, setDisagreement] = useState<Disagreement>({ title: '', messages: [] })
  const [newMessage, setNewMessage] = useState('')
  const [isInviteModalOpen, setInviteModalOpen] = useState(false)
  const [isManagerModalOpen, setManagerModalOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const uploadRef = useRef(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const participantsRef = useRef(null)
  const socketRef = useRef<Socket | null>(null)
  const [ephemeralMessages, setEphemeralMessages] = useState<{ text: string }[]>([])

  const { user, token } = useAuth()
  const currentUserId = user?._id || (user as any)?.id || null

  // Render the special DAI introduction with larger emojis and spaced paragraphs
  const renderDAIIntro = (raw: string) => {
    try {
      const lines = String(raw || '').split(/\r?\n/).map(l => l.trim());
      const elements: JSX.Element[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const m = line.match(/^([1-3])\.\s*(.+)$/);
        if (m) {
          let rest = m[2];
          let emoji = '';
          ['💯','💬','➕'].forEach(e => {
            if (!emoji && rest.includes(e)) {
              emoji = e;
              rest = rest.replace(e, '').trim();
            }
          });
          elements.push(
            <div key={`h-${i}`} className="flex items-center gap-2 mt-3">
              <span className="text-4xl leading-none" aria-hidden>{emoji || '•'}</span>
              <span className="text-lg font-semibold">{rest}</span>
            </div>
          );
          const next = (lines[i+1] || '').trim();
          if (next && !/^[1-3]\./.test(next)) {
            elements.push(<p key={`p-${i}`} className="mb-4">{next}</p>);
            i++;
          }
          continue;
        }
        // Default paragraph (no extra margin)
        elements.push(<p key={`t-${i}`}>{line}</p>);
      }
      return <div>{elements}</div>;
    } catch {
      return <p className="text-lg whitespace-pre-wrap">{String(raw || '')}</p>;
    }
  }

  const openInviteModal = () => setInviteModalOpen(true)
  const closeInviteModal = () => setInviteModalOpen(false)
  const openManagerModal = () => setManagerModalOpen(true)
  const closeManagerModal = () => setManagerModalOpen(false)

  useEffect(() => {
    const fetchDisagreement = async () => {
      try {
        setIsLoading(true)
        setError('')
        if (!token) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }
        const res = await axios.get(`${API_URL}/disagreements/${id}` , {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = res.data || {}
        data.messages = Array.isArray(data.messages) ? data.messages : []
        setDisagreement(data)
      } catch (err: any) {
        const message =
          (err && err.response && err.response.data && err.response.data.message) ||
          err?.message ||
          'Failed to load disagreement'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    // noinspection JSIgnoredPromiseFromCall
    if (id) void fetchDisagreement()
  }, [id, token])

  // Socket setup
  useEffect(() => {
    if (!id) return
    const socket = io(SOCKET_BASE, { transports: ['websocket'], withCredentials: true })
    socketRef.current = socket

    const handleConnect = () => {
      const displayName = (user && ((user as any).name || (user as any).fullName || (user as any).username || (user as any).email)) || 'Guest'
      socket.emit('join_room', { roomId: id, userName: displayName })
    }
    socket.on('connect', handleConnect)

    const handleReceive = (data: Message) => {
      setDisagreement((prev) => {
        const prevMsgs = Array.isArray(prev.messages) ? prev.messages : []
        return { ...prev, messages: [...prevMsgs, data] }
      })
    }
    const handleSystemMessage = (data: { text?: string }) => {
      const text = (data?.text || '').toString()
      if (!text) return
      setEphemeralMessages((prev) => [...prev, { text }])
    }
    socket.on('receive_message', handleReceive)
    socket.on('systemMessage', handleSystemMessage)

    const handleProposalUpdated = (updated: any) => {
      if (!updated || !updated._id) return
      setDisagreement((prev) => {
        const prevMsgs = Array.isArray(prev.messages) ? prev.messages : []
        const idx = prevMsgs.findIndex((m: any) => String(m?._id) === String(updated._id))
        if (idx === -1) return prev
        const nextMsgs = [...prevMsgs]
        nextMsgs[idx] = updated as any
        return { ...prev, messages: nextMsgs }
      })
    }
    socket.on('proposalUpdated', handleProposalUpdated)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('receive_message', handleReceive)
      socket.off('systemMessage', handleSystemMessage)
      socket.off('proposalUpdated', handleProposalUpdated)
      socket.disconnect()
      socketRef.current = null
    }
  }, [id])
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (uploadRef.current && !(uploadRef.current as any).contains(target)) {
        setShowUpload(false)
      }
      if (participantsRef.current && !(participantsRef.current as any).contains(target)) {
        setShowParticipants(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [uploadRef, participantsRef])
  
  const handleSendMessage = () => {
    const text = (newMessage || '').trim()
    if (!text) return
    if (!socketRef.current) return
    const payload = { roomId: id, sender: currentUserId, text }
    socketRef.current.emit('send_message', payload)
    setNewMessage('')
  }

  const finalizeCase = async () => {
    if (!id || !token) return
    setFinalizing(true)
    try {
      await axios.post(`${API_URL}/disagreements/${id}/finalize`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setDisagreement((prev) => ({ ...prev, archivedAt: new Date().toISOString() }))
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to finalize agreement.'
      alert(msg)
    } finally {
      setFinalizing(false)
    }
  }

  const handleDownloadAgreement = async () => {
    if (!id || !token) return
    setDownloading(true)
    try {
      const res = await axios.get(`${API_URL}/disagreements/${id}/agreement`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `agreement-${(disagreement as any)?.caseId || id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to download agreement.'
      alert(msg)
    } finally {
      setDownloading(false)
    }
  }

  // Determine if current user is the creator (assume first participant is the creator for now)
  const participantsList = Array.isArray((disagreement as any)?.participants) ? (disagreement as any).participants : []
  const creatorUserId = participantsList.length > 0 ? (participantsList[0]?.user?._id || participantsList[0]?.user) : null
  const isCreator = currentUserId && creatorUserId ? String(currentUserId) === String(creatorUserId) : false
  const activeParticipantCount = Array.isArray(participantsList) ? participantsList.filter((p: any) => (p?.status || 'active') === 'active').length : 0

  return (
    <div className="min-h-screen bg-white font-sans px-4 md:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 md:gap-6 min-h-[calc(100vh-2rem)]">
        {/* Sidebar */}
        <aside className="bg-white md:rounded-xl md:shadow p-4 border-r border-slate-200 md:border-0">
          <nav className="space-y-4">
            <Link 
              to={{ pathname: '/dashboard' }} 
              className="flex items-center gap-2 text-lg font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Dashboard</span>
            </Link>
            
            <hr/>
            
            {/* This is where the list of other disagreements will go in the future */}
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Your Disagreements</h3>
            <p className="text-slate-500 text-sm">Disagreement list coming soon.</p>
          </nav>
        </aside>

        {/* Chat Panel */}
        <section className="bg-white rounded-xl shadow p-0 md:p-6 flex flex-col min-h-[60vh]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-500 text-lg">Loading…</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 font-semibold">{error}</div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 md:px-0 pt-4 md:pt-0 flex items-center justify-between">
                <div className="px-4 md:px-0 pt-4 md:pt-0">
                  <h2 className="text-xl font-bold text-slate-800 truncate">{disagreement.title || 'Disagreement'}</h2>
                  <p className="text-sm font-semibold text-blue-600">AI Mediator Mode</p>
                  {Boolean((disagreement as any)?.caseId) && (
                    <p className="text-xs text-slate-500 font-mono">Case ID: {(disagreement as any).caseId}</p>
                  )}
                  <div className="mt-2">
                    <div className="relative inline-block" ref={participantsRef}>
                      <button
                        type="button"
                        onClick={() => setShowParticipants(!showParticipants)}
                        className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-slate-100"
                        aria-haspopup="true"
                        aria-expanded={showParticipants}
                        aria-label="Show participants"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span className="text-sm text-slate-600">Participants: {participantsList.length}</span>
                      </button>
                      {showParticipants && (
                        <div className="absolute z-10 mt-2 w-64 max-w-[80vw] bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                          <p className="text-xs uppercase text-slate-400 font-semibold mb-2">Participants</p>
                          <ul className="space-y-1">
                            {participantsList.length === 0 ? (
                              <li className="text-sm text-slate-500">No participants yet</li>
                            ) : (
                              participantsList.map((p: any, i: number) => {
                                const name = p?.user?.name || p?.user?.email || 'Participant'
                                return (
                                  <li key={i} className="text-sm text-slate-700">{name}</li>
                                )
                              })
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                    {(disagreement as any)?.archivedAt && (
                      <div className="mt-2">
                        <button onClick={handleDownloadAgreement} disabled={downloading} className={`inline-flex items-center rounded-md font-semibold shadow-sm px-4 py-2 text-sm ${downloading ? 'bg-emerald-300 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          {downloading ? 'Preparing…' : 'Download Agreement'}
                        </button>
                      </div>
                    )}
                </div>
                {isCreator && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openInviteModal}
                      className="inline-flex items-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 px-4 py-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" x2="23" y1="8" y2="14"/><line x1="20" x2="26" y1="11" y2="11"/></svg>
                      Invite
                    </button>
                    <button
                      onClick={openManagerModal}
                      className="inline-flex items-center rounded-md bg-slate-700 text-white font-semibold shadow-sm hover:bg-slate-600 px-4 py-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>
                      Manage
                    </button>
                    <button
                      onClick={finalizeCase}
                      disabled={finalizing || Boolean((disagreement as any)?.archivedAt)}
                      className={`inline-flex items-center rounded-md font-semibold shadow-sm px-4 py-2 text-lg ${finalizing || (disagreement as any)?.archivedAt ? 'bg-emerald-300 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><polyline points="20 6 9 17 4 12"/></svg>
                      {finalizing ? 'Finalizing…' : ((disagreement as any)?.archivedAt ? 'Finalized' : 'Finalize')}
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-0 mt-4 space-y-3">
                {/* Ephemeral system messages (not persisted) */}
                {ephemeralMessages.map((m, i) => (
                  <div key={`sys-${i}`} className="text-center italic text-slate-500">
                    {m.text}
                  </div>
                ))}

                {disagreement.messages.length === 0 ? (
                  <p className="text-slate-500">No messages yet.</p>
                ) : (
                  disagreement.messages.map((msg, idx) => {
                    if ((msg as any)?.isProposal) {
                      return (<ProposalMessage key={msg._id || idx} message={msg as any} disagreementId={String(id)} participantCount={activeParticipantCount} isCreator={isCreator} />)
                    }
                    const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || (msg as any).sender?.id) : (msg as any).sender
                    const isMine = currentUserId && senderId && String(senderId) === String(currentUserId)
                    const isAI = Boolean((msg as any)?.isAIMessage) || (typeof msg.sender === 'object' && typeof (msg as any)?.sender?.name === 'string' && ['ai mediator','dai'].includes(((msg as any).sender.name as string).toLowerCase()))
                    const senderName = ((msg as any)?.sender && (msg as any).sender.name) ? (msg as any).sender.name : (isAI ? 'Mediator' : (isMine ? 'You' : 'Participant'))

                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {/* AI avatar on left for AI messages */}
                        {!isMine && isAI && (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs select-none">AI</div>
                        )}
                        <div className="flex flex-col max-w-[75%]">
                          <span className="text-xs text-slate-500 mb-1 ml-2">{senderName}</span>
                          <div
                            className={`${isMine ? 'bg-slate-200 text-slate-900 self-end' : isAI ? 'bg-[#F3F4FF] text-slate-900' : 'bg-slate-100 text-slate-900'} px-4 py-2 rounded-2xl shadow-sm`}
                          >
                            {isAI && typeof msg.text === 'string' && msg.text.trim().toLowerCase().startsWith('hello, i am dai.')
                              ? renderDAIIntro(String(msg.text))
                              : <p className="text-lg whitespace-pre-wrap">{msg.text}</p>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="mt-2 px-4 md:px-0 pb-4 md:pb-0 flex items-center gap-2"
              >
                <div className="relative group" ref={uploadRef}>
                  <button
                    type="button"
                    onClick={() => setShowUpload(!showUpload)}
                    className="p-2 rounded-full hover:bg-slate-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  </button>
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    Add Files
                  </div>
                  {showUpload && (
                    <div className="absolute bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex items-center gap-2 whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-600"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      <span className="font-semibold text-slate-700">Upload files</span>
                    </div>
                  )}
                </div>
                <input
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-3 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>

              {/* AI legal disclaimer placed below the composer */}
              <div className="px-4 md:px-0 pt-2">
                <p className="text-xs italic text-slate-500 text-right">The AI doesn't provide legally binding advice.</p>
              </div>

              {/* Invitation Modals */}
              <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={closeInviteModal}
                disagreementId={id}
                publicInviteToken={disagreement?.publicInviteToken?.token || ''}
              />
              <InvitationManager
                isOpen={isManagerModalOpen}
                onClose={closeManagerModal}
                disagreement={disagreement as any}
                onInviteNew={openInviteModal}
                onUpdated={(updated: any) => setDisagreement(updated)}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
