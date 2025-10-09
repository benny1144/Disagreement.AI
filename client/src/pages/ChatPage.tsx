import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import InviteUserModal from '../components/InviteUserModal.jsx'

interface Message {
  _id?: string
  sender?: any
  text: string
}

interface Disagreement {
  text?: string
  messages: Message[]
}

export default function ChatPage(): JSX.Element {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [disagreement, setDisagreement] = useState<Disagreement>({ text: '', messages: [] })
  const [newMessage, setNewMessage] = useState('')
  const [isInviteOpen, setInviteOpen] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const currentUserId = (() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return null
      const user = JSON.parse(stored)
      return user?._id || user?.id || null
    } catch {
      return null
    }
  })()

  const onOpen = () => setInviteOpen(true)
  const onClose = () => setInviteOpen(false)

  useEffect(() => {
    const fetchDisagreement = async () => {
      try {
        setIsLoading(true)
        setError('')
        const stored = localStorage.getItem('user')
        if (!stored) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }
        const user = JSON.parse(stored)
        const res = await axios.get(`http://localhost:3000/api/disagreements/${id}` , {
          headers: { Authorization: `Bearer ${user.token}` },
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

    if (id) fetchDisagreement()
  }, [id])

  // Socket setup
  useEffect(() => {
    if (!id) return
    const socket = io('http://localhost:3000', { transports: ['websocket'], withCredentials: true })
    socketRef.current = socket

    const handleConnect = () => {
      socket.emit('join_room', { roomId: id })
    }
    socket.on('connect', handleConnect)

    const handleReceive = (data: Message) => {
      setDisagreement((prev) => {
        const prevMsgs = Array.isArray(prev.messages) ? prev.messages : []
        return { ...prev, messages: [...prevMsgs, data] }
      })
    }
    socket.on('receive_message', handleReceive)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('receive_message', handleReceive)
      socket.disconnect()
      socketRef.current = null
    }
  }, [id])

  const handleSendMessage = () => {
    const text = (newMessage || '').trim()
    if (!text) return
    if (!socketRef.current) return
    const payload = { roomId: id, sender: currentUserId, text }
    socketRef.current.emit('send_message', payload)
    setNewMessage('')
  }

  return (
    <div className="min-h-screen bg-white font-sans px-4 md:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 md:gap-6 min-h-[calc(100vh-2rem)]">
        {/* Sidebar */}
        <aside className="bg-white md:rounded-xl md:shadow p-4 border-r border-slate-200 md:border-0">
          <p className="text-slate-500">Sidebar — Disagreements List (placeholder)</p>
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
                <h2 className="text-xl font-bold text-slate-800">{disagreement.text || 'Disagreement'}</h2>
                <button
                  onClick={onOpen}
                  className="inline-flex items-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 px-4 py-2 text-lg"
                >
                  Invite
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-0 mt-4 space-y-3">
                {disagreement.messages.length === 0 ? (
                  <p className="text-slate-500">No messages yet.</p>
                ) : (
                  disagreement.messages.map((msg, idx) => {
                    const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || (msg as any).sender?.id) : (msg as any).sender
                    const isMine = currentUserId && senderId && String(senderId) === String(currentUserId)
                    const isAI = !isMine && (typeof msg.sender === 'string' && (msg.sender as string).toLowerCase() === 'ai' || (msg as any).isAI)

                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {/* AI avatar on left for AI messages */}
                        {!isMine && isAI && (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs select-none">AI</div>
                        )}
                        <div
                          className={`${isMine ? 'bg-blue-600 text-white' : isAI ? 'bg-[#F3F4FF] text-slate-900' : 'bg-slate-100 text-slate-900'} px-4 py-2 rounded-2xl max-w-[75%] shadow-sm`}
                        >
                          <p className="text-lg">{msg.text}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Persistent legal disclaimer (sticky above input) */}
              <div className="px-4 md:px-0 sticky bottom-20 md:bottom-24">
                <p className="text-sm italic text-slate-500">Please note: The AI does not provide legally binding advice.</p>
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="mt-2 px-4 md:px-0 pb-4 md:pb-0 flex items-center gap-2"
              >
                <input
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 px-4 py-2 text-lg"
                >
                  Send
                </button>
              </form>

              {/* Invite Modal */}
              <InviteUserModal isOpen={isInviteOpen} onClose={onClose} disagreementId={id} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
