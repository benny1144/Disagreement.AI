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
  try {
    // Look up the AI user account
    const aiUser = await User.findOne({ email: AI_USER_EMAIL })
    if (!aiUser) {
      console.error('CRITICAL: The AI Mediator user account does not exist in the database.')
      return
    }

    const disagreement = await Disagreement.findById(disagreementId)
    if (!disagreement) return

    // Prevent duplicate messages
    if (disagreement.aiOnboardingMessageSent) return

    const welcomeMessage = {
      sender: aiUser._id,
      text:
        'Welcome. I am the AI Mediator for this discussion. My role is to provide a neutral, structured environment to help you find a resolution. To begin, please could each participant briefly state their perspective on the disagreement.',
      isAIMessage: true,
    }

    disagreement.messages.push(welcomeMessage)
    disagreement.aiOnboardingMessageSent = true
    await disagreement.save()

    console.log(`AI onboarding message posted to disagreement ${disagreementId}`)
  } catch (error) {
    console.error(`Error posting AI onboarding message: ${error?.message || error}`)
  }
}

export default { postOnboardingMessage }
