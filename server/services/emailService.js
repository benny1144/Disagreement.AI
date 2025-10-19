import React from 'react'
import { Resend } from 'resend'
// Note: templates remain in the repo root under /emails; since Render rootDir is ./server,
// these relative paths go up one level to reach them.
import ContactFormEmail from '../emails/ContactFormEmail.js'
import WelcomeEmail from '../emails/WelcomeEmail.js'
import DirectInviteEmail from '../emails/DirectInviteEmail.js'

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

/**
 * Sends a welcome email to a newly registered user.
 * @param {string} email - Recipient email address.
 * @param {string} name - Recipient name.
 */
export const sendWelcomeEmail = async (email, name) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  try {
    await resend.emails.send({
      from: 'welcome@disagreement.ai',
      to: email,
      subject: `Welcome to Disagreement.AI, ${name || ''}`.trim(),
      react: React.createElement(WelcomeEmail, { name }),
    })
    console.log(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

/**
 * Sends a direct invite email to a participant.
 * @param {string} email - Recipient email address.
 * @param {string} name - Recipient name (optional).
 * @param {{ creatorName: string, disagreementTitle: string, customMessage?: string, inviteLink: string }} details
 */
export const sendDirectInviteEmail = async (email, name, details) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  const { creatorName, disagreementTitle, customMessage, inviteLink } = details || {}
  try {
    await resend.emails.send({
      from: 'invites@disagreement.ai',
      to: email,
      subject: `${creatorName || 'Someone'} invited you to join ${disagreementTitle || 'a disagreement'}`,
      react: React.createElement(DirectInviteEmail, {
        recipientName: name,
        inviterName: creatorName,
        disagreementTitle,
        customMessage,
        inviteLink,
      }),
    })
    console.log(`Direct invite email sent to ${email}`)
  } catch (error) {
    console.error('Error sending direct invite email:', error)
  }
}

/**
 * Sends the final agreement PDF to all participants.
 * @param {string[]|string} toList - One or more recipient email addresses.
 * @param {Buffer} pdfBuffer - The PDF file contents.
 * @param {string} [filename]
 */
export const sendAgreementEmail = async (toList, pdfBuffer, filename = 'agreement.pdf') => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  try {
    await resend.emails.send({
      from: 'agreement@disagreement.ai',
      to: toList,
      subject: 'Your final agreement from Disagreement.AI',
      text: 'Attached is the finalized agreement PDF for your records.',
      attachments: [
        { filename, content: pdfBuffer }
      ],
    })
    console.log('Agreement email sent to:', Array.isArray(toList) ? toList.join(', ') : toList)
  } catch (error) {
    console.error('Error sending agreement email:', error)
  }
}

/**
 * Notify the creator that a user requested to join via public link.
 * @param {string} toCreator
 * @param {string} requestorName
 * @param {string} disagreementTitle
 */
export const sendApprovalRequestEmail = async (toCreator, requestorName, disagreementTitle) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  try {
    await resend.emails.send({
      from: 'notifications@disagreement.ai',
      to: toCreator,
      subject: `${requestorName || 'Someone'} requested to join "${disagreementTitle || 'your disagreement'}"`,
      text: `${requestorName || 'Someone'} has requested to join "${disagreementTitle || 'your disagreement'}". Visit your dashboard to approve or deny the request: https://disagreement.ai/dashboard`,
    })
    console.log('Approval request email sent to creator:', toCreator)
  } catch (error) {
    console.error('Error sending approval request email:', error)
  }
}

/**
 * Notify a requester that their approval has been granted.
 * @param {string} toRequestor
 * @param {string} disagreementTitle
 */
export const sendApprovalConfirmationEmail = async (toRequestor, disagreementTitle) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Skipping email send.')
    return
  }
  if (!resend) {
    console.error('Resend client not initialized. Skipping email send.')
    return
  }
  try {
    await resend.emails.send({
      from: 'notifications@disagreement.ai',
      to: toRequestor,
      subject: `You have been approved to join "${disagreementTitle || 'a disagreement'}"`,
      text: `Your request to join "${disagreementTitle || 'a disagreement'}" has been approved. Click here to open the chat: https://disagreement.ai/dashboard`,
    })
    console.log('Approval confirmation email sent to requestor:', toRequestor)
  } catch (error) {
    console.error('Error sending approval confirmation email:', error)
  }
}

export default {
  sendContactFormEmail,
  sendWelcomeEmail,
  sendDirectInviteEmail,
  sendAgreementEmail,
  sendApprovalRequestEmail,
  sendApprovalConfirmationEmail,
}
