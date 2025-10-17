import React from 'react'

// Minimal React email template for internal team notifications
// Avoid JSX pitfalls in Node by keeping to simple, renderable structure.
export default function ContactFormEmail({ name, email, message }) {
  const safeName = name || 'Anonymous'
  const safeEmail = email || 'unknown@example.com'
  const safeMessage = typeof message === 'string' ? message : ''

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

  const labelStyle = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }
  const valueStyle = { fontSize: '16px', color: '#0f172a', fontWeight: 600 }

  return React.createElement(
    'div',
    { style: containerStyle },
    React.createElement('h1', { style: { fontSize: 20, margin: '0 0 8px 0' } }, 'New Contact Form Submission'),
    React.createElement('p', { style: { margin: '0 0 16px 0', color: '#334155' } }, 'Someone submitted the website contact form.'),
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement(
        'div',
        { style: { marginBottom: 12 } },
        React.createElement('div', { style: labelStyle }, 'Name'),
        React.createElement('div', { style: valueStyle }, safeName),
      ),
      React.createElement(
        'div',
        { style: { marginBottom: 12 } },
        React.createElement('div', { style: labelStyle }, 'Email'),
        React.createElement('div', { style: valueStyle }, safeEmail),
      ),
      React.createElement(
        'div',
        null,
        React.createElement('div', { style: labelStyle }, 'Message'),
        React.createElement('div', { style: { fontSize: 16, color: '#0f172a', whiteSpace: 'pre-wrap' } }, safeMessage),
      ),
    ),
    React.createElement('p', { style: { fontSize: 12, color: '#64748b', marginTop: 16 } }, 'This notification was sent automatically by disagreement.ai'),
  )
}
