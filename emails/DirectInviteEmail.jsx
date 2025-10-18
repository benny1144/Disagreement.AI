import React from 'react'

export default function DirectInviteEmail({ recipientName, inviterName, disagreementTitle, customMessage, inviteLink }) {
  const safeRecipient = recipientName || 'there'
  const safeInviter = inviterName || 'Someone'
  const safeTitle = disagreementTitle || 'a disagreement'
  const safeMessage = typeof customMessage === 'string' && customMessage.trim() ? customMessage.trim() : ''
  const safeLink = inviteLink || 'https://www.disagreement.ai'

  const containerStyle = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    padding: '24px',
    lineHeight: 1.5,
  }

  const cardStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  }

  const buttonStyle = {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 700,
    marginTop: '8px'
  }

  return React.createElement(
    'div',
    { style: containerStyle },
    React.createElement('h1', { style: { fontSize: 20, margin: '0 0 8px 0' } }, `${safeInviter} invited you to join "${safeTitle}"`),
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement('p', { style: { margin: '0 0 12px 0', color: '#334155' } }, `Hi ${safeRecipient},`),
      React.createElement('p', { style: { margin: '0 0 12px 0', color: '#334155' } }, `${safeInviter} has invited you to participate in the disagreement "${safeTitle}" on Disagreement.AI.`),
      safeMessage
        ? React.createElement(
            'blockquote',
            { style: { margin: '0 0 12px 0', color: '#0f172a', borderLeft: '3px solid #e2e8f0', paddingLeft: '12px' } },
            safeMessage
          )
        : null,
      React.createElement('a', { href: safeLink, style: buttonStyle }, 'Join Disagreement Now')
    ),
    React.createElement('p', { style: { fontSize: 12, color: '#64748b', marginTop: 16 } }, 'This invitation was sent via Disagreement.AI')
  )
}
