import Disagreement from '../models/disagreementModel.js'
import User from '../models/userModel.js'

// Dedicated AI mediator identity (ensure this user exists in the DB)
const AI_USER_EMAIL = 'ai-mediator@disagreement.ai'

/**
 * Posts the initial onboarding message from the AI mediator to a disagreement.
 * Only runs once per disagreement (guarded by aiOnboardingMessageSent flag).
 * @param {string} disagreementId
 */
export const postOnboardingMessage = async (disagreementId) => {
  console.log('[aiService.postOnboardingMessage] START', { disagreementId })
  try {
    // Look up the AI user account
    console.log('[aiService.postOnboardingMessage] Looking up AI user by email', AI_USER_EMAIL)
    const aiUser = await User.findOne({ email: AI_USER_EMAIL })
    if (!aiUser) {
      console.error('[aiService.postOnboardingMessage] CRITICAL: AI Mediator user not found')
      return
    }

    console.log('[aiService.postOnboardingMessage] Fetching disagreement by ID')
    const disagreement = await Disagreement.findById(disagreementId)
    if (!disagreement) {
      console.error('[aiService.postOnboardingMessage] Disagreement not found')
      return
    }

    // Prevent duplicate messages
    console.log('[aiService.postOnboardingMessage] aiOnboardingMessageSent?', disagreement.aiOnboardingMessageSent)
    if (disagreement.aiOnboardingMessageSent) {
      console.log('[aiService.postOnboardingMessage] Already sent. Skipping.')
      return
    }

    const welcomeMessage = {
      sender: aiUser._id,
      text:
        'Welcome. I am the AI Mediator for this discussion. My role is to provide a neutral, structured environment to help you find a resolution. To begin, please could each participant briefly state their perspective on the disagreement.',
      isAIMessage: true,
    }

    const beforeCount = Array.isArray(disagreement.messages) ? disagreement.messages.length : 0
    console.log('[aiService.postOnboardingMessage] Pushing welcome message. Current message count:', beforeCount)
    disagreement.messages.push(welcomeMessage)
    disagreement.aiOnboardingMessageSent = true
    console.log('[aiService.postOnboardingMessage] Saving disagreement…')
    await disagreement.save()
    const afterCount = Array.isArray(disagreement.messages) ? disagreement.messages.length : 0

    console.log('[aiService.postOnboardingMessage] SUCCESS: saved. Message count now:', afterCount, 'flag:', disagreement.aiOnboardingMessageSent)
  } catch (error) {
    console.error('[aiService.postOnboardingMessage] ERROR:', error?.message || error)
  } finally {
    console.log('[aiService.postOnboardingMessage] END', { disagreementId })
  }
}

export default { postOnboardingMessage }
