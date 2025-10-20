import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Simple global chat state using React Context to avoid adding new dependencies.
// Exposes visibility, active disagreement id, readOnly flag, mute notifications, and setters.

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeDisagreementId, setActiveDisagreementId] = useState(null)
  const [readOnly, setReadOnly] = useState(false)
  const [muteNotifications, setMuteNotifications] = useState(false)

  const openChat = useCallback((disagreementId, opts = {}) => {
    setActiveDisagreementId(disagreementId || null)
    setReadOnly(Boolean(opts?.readOnly))
    setIsChatOpen(true)
  }, [])

  const closeChat = useCallback(() => {
    setIsChatOpen(false)
    // keep activeDisagreementId remembered so user can reopen quickly if needed
  }, [])

  const toggleMute = useCallback(() => setMuteNotifications((m) => !m), [])

  const value = useMemo(() => ({
    isChatOpen,
    activeDisagreementId,
    readOnly,
    muteNotifications,
    openChat,
    closeChat,
    setActiveDisagreementId,
    setReadOnly,
    setIsChatOpen,
    toggleMute,
    setMuteNotifications,
  }), [isChatOpen, activeDisagreementId, readOnly, muteNotifications, openChat, closeChat, toggleMute])

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within a ChatProvider')
  return ctx
}
