import asyncHandler from 'express-async-handler'
import { sendContactFormEmail } from '../../services/emailService.js'

// Middleware: validate and notify team via email; continue to next handler
export const notifyTeam = asyncHandler(async (req, _res, next) => {
  const { name, fullName, email, message } = req.body || {}
  const senderName = (name && String(name).trim()) || (fullName && String(fullName).trim()) || ''
  const senderEmail = email && String(email).trim()
  const senderMessage = message && String(message).trim()

  // Only attempt email if minimally valid; main route handles strict validation/response
  if (!senderName || !senderEmail || !senderMessage) {
    return next()
  }

  try {
    await sendContactFormEmail({ name: senderName, email: senderEmail, message: senderMessage })
  } catch (e) {
    // Do not block request on email failures; logging is inside service
  }
  return next()
})

export default { notifyTeam }
