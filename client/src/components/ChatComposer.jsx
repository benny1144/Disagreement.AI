import React, { useEffect, useRef } from 'react'

function AutosizeTextarea({ value, onChange, rows = 2, maxRows = 8, className = '', ...rest }) {
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
      className={`w-full resize-none outline-none ${className}`}
      {...rest}
    />
  )
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  onFileChange,
  readOnly = false,
}) {
  const disabled = readOnly || !String(value || '').trim()
  const inputRef = useRef(null)

  return (
    <div className="w-full">
      <div className="relative flex items-center border border-slate-200 bg-white rounded-2xl px-12 py-2">
        {/* Left circular + button inside container */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
          aria-label="Upload"
          title="Upload"
        >
          +
        </button>
        {/* Textarea */}
        <AutosizeTextarea
          value={value}
          onChange={onChange}
          rows={2}
          maxRows={8}
          className="px-2 py-1"
          placeholder={readOnly ? 'Read-only mode' : 'Type a message…'}
          disabled={readOnly}
        />
        {/* Right circular send button inside container */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white flex items-center justify-center ${disabled ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
          aria-label="Send message"
          title={disabled ? 'Enter message to send' : 'Send message'}
        >
          →
        </button>
      </div>
      {/* Hidden file input to enable camera/gallery/files on mobile */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
        capture="environment"
      />
    </div>
  )
}
