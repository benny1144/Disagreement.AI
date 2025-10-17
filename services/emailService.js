import React from 'react'
import { Resend } from 'resend'
import ContactFormEmail from '../emails/ContactFormEmail.js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Sends a contact form submission as an email to the admin.
 * @param {object} formData - The data from the contact form.
 * @param {string} formData.name - Sender's name.
 * @param {string} formData.email - Sender's email.
 * @param {string} formData.message - Sender's message.
 */
export const sendContactFormEmail = async (formData) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  const name = formData?.name || formData?.fullName || 'Anonymous'
  const payload = { name, email: formData?.email, message: formData?.message }
  try {
    await resend.emails.send({
      from: 'contact-form@disagreement.ai',
      to: 'contact@disagreement.ai', // Internal team email address
      subject: `New Contact Form Submission from ${name}`,
      react: React.createElement(ContactFormEmail, payload),
    })
    console.log(`Contact form email sent successfully from ${formData?.email}`)
  } catch (error) {
    console.error('Error sending contact form email:', error)
  }
}

export default {
  sendContactFormEmail,
}
