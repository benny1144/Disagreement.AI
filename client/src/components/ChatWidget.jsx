import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useChat } from '@/state/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import ProposalMessage from './ProposalMessage.jsx'

// Determine API and Socket base similar to ChatPage
const envApi = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const API_BASE = envApi && String(envApi).trim() !== '' ? String(envApi).replace(/\/$/, '') : ''
const API_URL = API_BASE ? `${API_BASE}/api` : '/api'
const SOCKET_BASE = API_BASE || undefined

function TTSButton({ text }) {
  const speak = useCallback(() => {
    try {
      if (!text) return
      const utter = new SpeechSynthesisUtterance(String(text))
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
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
  const { token } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [disagreement, setDisagreement] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const socketRef = useRef(null)

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])

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

    socket.emit('joinDisagreement', { disagreementId: activeDisagreementId })

    socket.on('newMessage', (msg) => {
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
    if (!text || !activeDisagreementId) return
    try {
      setInput('')
      await axios.post(`${API_URL}/disagreements/${activeDisagreementId}/messages`, { text }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to send message.')
    }
  }

  const onUploadClick = () => fileInputRef.current?.click()

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
    : 'fixed bottom-4 right-4 w-[500px] h-[700px] z-50'

  if (!isChatOpen) return null

  return (
    <div className={containerClasses}>
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-800 truncate" title={title}>{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100"
              title="Mute Notifications"
              aria-label="Mute Notifications"
            >
              {muteNotifications ? '🔇' : '🔈'}
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

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
          <div className="flex items-end gap-2">
            <button type="button" onClick={onUploadClick} className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700" aria-label="Upload">
              +
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
              capture="environment"
            />
            <div className="flex-1 min-w-0">
              <AutosizeTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                maxRows={8}
                className="w-full resize-none outline-none border border-slate-200 rounded-lg px-3 py-2 focus:border-slate-400"
                placeholder={readOnly ? 'Read-only mode' : 'Type a message…'}
                disabled={readOnly}
              />
            </div>
            <button
              type="button"
              onClick={sendMessage}
              disabled={readOnly || !input.trim()}
              className={`px-3 py-2 rounded-md text-white font-semibold ${readOnly || !input.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              Send
            </button>
          </div>
          {uploading && <div className="text-xs text-slate-500 mt-1">Uploading…</div>}
        </div>
      </div>
    </div>
  )
}
