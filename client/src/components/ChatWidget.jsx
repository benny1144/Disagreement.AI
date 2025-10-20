import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useChat } from '@/state/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import ProposalMessage from './ProposalMessage.jsx'
import ChatWidgetHeader from './ChatWidgetHeader.jsx'
import ChatComposer from './ChatComposer.jsx'

// Determine API and Socket base similar to ChatPage
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'
const SOCKET_BASE = API_BASE || undefined

function TTSButton({ text }) {
  const speak = useCallback(() => {
    try {
      if (!text) return
      // Toggle stop on re-click
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
        return
      }
      const utterance = new SpeechSynthesisUtterance(String(text))
      const trySpeakWithPreferredVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => /Google|Microsoft|Siri/i.test(v.name)) || voices[0]
        if (preferredVoice) utterance.voice = preferredVoice
        window.speechSynthesis.speak(utterance)
      }
      const existing = window.speechSynthesis.getVoices()
      if (!existing || existing.length === 0) {
        const handler = () => {
          trySpeakWithPreferredVoice()
          window.speechSynthesis.removeEventListener('voiceschanged', handler)
        }
        window.speechSynthesis.addEventListener('voiceschanged', handler)
        // Attempt to speak even if voices not yet loaded
        window.speechSynthesis.speak(utterance)
      } else {
        trySpeakWithPreferredVoice()
      }
    } catch (e) {
      console.warn('TTS not available', e)
    }
  }, [text])

  return (
    <button
      type="button"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 text-sm"
      title="Read aloud"
      onClick={speak}
      aria-label="Read aloud"
    >
      🔊
    </button>
  )
}

function AutosizeTextarea({ value, onChange, rows = 2, maxRows = 8, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = parseInt(window.getComputedStyle(el).lineHeight || '20', 10)
    const maxHeight = lineHeight * maxRows
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value, maxRows])

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={onChange}
      {...rest}
    />
  )
}

export default function ChatWidget() {
  const { isChatOpen, activeDisagreementId, readOnly, muteNotifications, closeChat, toggleMute } = useChat()
  const { token, user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [disagreement, setDisagreement] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const socketRef = useRef(null)

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])

  // Derive current user id for sending messages via Socket.IO
  const currentUserId = useMemo(() => {
    try {
      if (user && (user._id || user.id)) return user._id || user.id
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed?._id || parsed?.id || parsed?.userId || null
      }
    } catch {}
    return null
  }, [user])

  const fetchDisagreement = useCallback(async (id) => {
    if (!id || !token) return
    try {
      setLoading(true)
      setError('')
      const res = await axios.get(`${API_URL}/disagreements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data || {}
      setDisagreement(data)
      setMessages(Array.isArray(data?.messages) ? data.messages : [])
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load conversation.')
    } finally {
      setLoading(false)
    }
  }, [token])

  // Initialize when opened
  useEffect(() => {
    if (!isChatOpen || !activeDisagreementId) return
    void fetchDisagreement(activeDisagreementId)
  }, [isChatOpen, activeDisagreementId, fetchDisagreement])

  // Socket setup
  useEffect(() => {
    if (!isChatOpen || !activeDisagreementId) return
    const socket = io(SOCKET_BASE || undefined, {
      path: '/socket.io',
      withCredentials: true,
      auth: token ? { token } : undefined,
    })
    socketRef.current = socket

    socket.emit('join_room', { roomId: activeDisagreementId, userName: (user && (user.name || user.email)) || '' })

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg])
      // Play ding when unmuted and page not focused
      try {
        if (!muteNotifications && typeof document !== 'undefined' && !document.hasFocus()) {
          const a = new Audio('/ding.mp3')
          a.play().catch(() => {})
        }
      } catch {}
    })

    return () => {
      socket.emit('leaveDisagreement', { disagreementId: activeDisagreementId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [isChatOpen, activeDisagreementId, token, muteNotifications])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !activeDisagreementId || !currentUserId) return
    try {
      setInput('')
      const sock = socketRef.current
      if (sock && typeof sock.emit === 'function') {
        sock.emit('send_message', { roomId: activeDisagreementId, sender: currentUserId, text })
      } else {
        // Fallback: optimistic UI update; socket should reconcile when reconnected
        setMessages((prev) => [
          ...prev,
          { _id: Math.random().toString(36).slice(2), sender: { _id: currentUserId, name: 'You' }, text },
        ])
      }
    } catch (e) {
      setError(e?.message || 'Failed to send message.')
    }
  }


  const onFileChange = async (e) => {
    const file = e?.target?.files?.[0]
    if (!file || !activeDisagreementId) return
    try {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      await axios.post(`${API_URL}/disagreements/${activeDisagreementId}/uploads`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Upload failed.')
    } finally {
      setUploading(false)
      if (e?.target) e.target.value = ''
    }
  }

  const title = disagreement?.title || 'Conversation'

  // Visibility and container classes per spec
  const containerClasses = isMobile
    ? 'fixed inset-0 w-full h-full z-50'
    : 'fixed bottom-4 right-4 w-[571px] h-[800px] z-50'

  if (!isChatOpen) return null

  return (
    <div className={containerClasses}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <ChatWidgetHeader
          title={title}
          participants={Array.isArray(disagreement?.participants) ? disagreement.participants : []}
          muteNotifications={muteNotifications}
          onToggleMute={toggleMute}
          onClose={closeChat}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading…</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            messages.map((m) => (
              m?.isProposal ? (
                <ProposalMessage
                  key={m._id || Math.random()}
                  message={m}
                  disagreementId={activeDisagreementId}
                  participantCount={Array.isArray(disagreement?.participants) ? disagreement.participants.length : 0}
                />
              ) : (
                <div key={m._id || Math.random()} className="flex flex-col group">
                  <div className={`self-${m?.sender?.isSelf ? 'end' : 'start'} max-w-[85%] rounded-2xl px-3 py-2 shadow-sm border ${m?.sender?.isSelf ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-sm text-slate-900 whitespace-pre-wrap">{m.text}</div>
                  </div>
                  <div className="mt-1">
                    <TTSButton text={m.text} />
                  </div>
                </div>
              )
            ))
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 bg-white p-2">
          <ChatComposer
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSend={sendMessage}
            onFileChange={onFileChange}
            readOnly={readOnly}
          />
          {uploading && <div className="text-xs text-slate-500 mt-1">Uploading…</div>}
          <div className="mt-2 text-[11px] text-slate-500">Dai doesn't provide legally binding advice.</div>
        </div>
      </div>
    </div>
  )
}
