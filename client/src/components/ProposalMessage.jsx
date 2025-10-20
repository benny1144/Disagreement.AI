import React from 'react'

/**
 * ProposalMessage
 * Renders an AI proposal card with distinct styling and Agree/Disagree buttons.
 * Props:
 * - message: { text: string, sender?: { name?: string }, isProposal?: boolean }
 */
export default function ProposalMessage({ message }) {
  const text = (message?.text || '').toString()
  const senderName = (message?.sender && message.sender.name) ? message.sender.name : 'AI Mediator'

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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-500"
                aria-label="I agree with this proposal"
                onClick={() => { /* wired up in future step */ }}
              >
                I Agree
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-800 bg-white text-sm font-semibold hover:bg-emerald-50"
                aria-label="I disagree with this proposal"
                onClick={() => { /* wired up in future step */ }}
              >
                I Disagree
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
