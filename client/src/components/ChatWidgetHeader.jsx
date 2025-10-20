import React, { useMemo, useState } from 'react'

export default function ChatWidgetHeader({
  title,
  participants = [],
  muteNotifications = false,
  onToggleMute,
  onClose,
}) {
  const [open, setOpen] = useState(false)

  const names = useMemo(() => {
    const list = []
    // Always put DAI first
    list.push('Dai - AI Mediator')
    if (Array.isArray(participants)) {
      for (const p of participants) {
        const n = (p && (p.user?.name || p.name)) || ''
        if (n) list.push(n)
      }
    }
    // Deduplicate while preserving order
    const seen = new Set()
    return list.filter((n) => {
      if (seen.has(n)) return false
      seen.add(n)
      return true
    })
  }, [participants])

  const count = (Array.isArray(participants) ? participants.length : 0) + 1

  return (
    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800 truncate" title={title}>{title}</h3>
          <div
            className="relative text-xs text-slate-600 mt-0.5 select-none"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              type="button"
              className="underline underline-offset-2 hover:text-slate-800"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={open}
              title="View participants"
            >
              Participants: {count}
            </button>
            {open && (
              <div className="absolute z-10 mt-1 w-56 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg p-2">
                <ul className="text-sm text-slate-800 space-y-1">
                  {names.map((n, idx) => (
                    <li key={idx} className={idx === 0 ? 'font-semibold' : ''}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100"
            title="Mute Notifications"
            aria-label="Mute Notifications"
          >
            {muteNotifications ? '🔇' : '🔈'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
