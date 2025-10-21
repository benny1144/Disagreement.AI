import React from 'react'

export default function WelcomeEmail({ name }) {
  const safeName = name || 'there'

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

  const ctaStyle = {
    display: 'inline-block',
    marginTop: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 600,
  }

  return React.createElement(
    'div',
    { style: containerStyle },
    React.createElement('h1', { style: { fontSize: 22, margin: '0 0 12px 0' } }, `Welcome to Disagreement.AI, ${safeName}!`),
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement(
        'p',
        { style: { margin: '0 0 12px 0', color: '#334155' } },
        'We\'re excited to have you on board. You can start a new disagreement, invite participants, and collaborate with our AI mediator.'
      ),
      React.createElement(
        'a',
        { href: 'https://disagreement.ai/dashboard', style: ctaStyle },
        'Start a New Disagreement'
      ),
      React.createElement(
        'p',
        { style: { margin: '12px 0 0 0', color: '#334155' } },
        'If you have any questions, just hit reply to this email or contact us at contact@disagreement.ai.'
      ),
    ),
    React.createElement('p', { style: { fontSize: 12, color: '#64748b', marginTop: 16 } }, '— The Disagreement.AI Team')
  )
}
