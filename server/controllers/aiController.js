import OpenAI from 'openai';
import Groq from 'groq-sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * POST /api/ai/summarize-description
 * Body: { description: string }
 * Response: { summary: string }
 */
export async function summarizeDescription(req, res) {
  try {
    const description = (req.body?.description || '').toString().trim();
    if (!description) {
      return res.status(400).json({ message: 'description is required' });
    }

    const system = 'You are a helpful assistant that rewrites text into a concise, neutral, single-sentence summary suitable as a description of a disagreement between parties. Avoid loaded language and bias; remove proper names and pronouns when possible.';
    const user = `Rewrite the following into one neutral, concise sentence (max ~25 words). Use plain language.\n\nTEXT:\n${description}`;

    let summary;
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 100,
      });
      summary = (completion?.choices?.[0]?.message?.content || '').trim();
    } catch (aiErr) {
      console.error('OpenAI error:', aiErr);
      // Fallback: naive truncation
      summary = description.replace(/\s+/g, ' ').trim();
      if (summary.length > 160) summary = summary.slice(0, 157) + '...';
    }

    if (!summary) {
      summary = description.slice(0, 160);
    }

    return res.status(200).json({ summary });
  } catch (err) {
    console.error('summarizeDescription error:', err);
    return res.status(500).json({ message: 'Failed to generate summary' });
  }
}

/**
 * POST /api/ai/summarize-title
 * Body: { title: string, description?: string }
 * Response: { title: string }
 */
export async function summarizeTitle(req, res) {
  try {
    const rawTitle = (req.body?.title || '').toString().trim();
    const description = (req.body?.description || '').toString().trim();
    if (!rawTitle) {
      return res.status(400).json({ message: 'title is required' });
    }

    const system = 'You are a helpful assistant that rewrites titles to be concise, neutral, and non-inflammatory. Avoid names and biased phrasing.';
    const user = `Rewrite the following title to be neutral and under 40 characters, using the description below for context. Title: ${rawTitle}. Description: ${description}.`;

    let newTitle;
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_TITLE_MODEL || process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 40,
      });
      newTitle = (completion?.choices?.[0]?.message?.content || '').trim();
      if (newTitle.length > 40) newTitle = newTitle.slice(0, 40);
    } catch (aiErr) {
      console.error('OpenAI error (summarizeTitle):', aiErr);
      // Fallback: naive sanitize + truncate
      newTitle = rawTitle.replace(/\s+/g, ' ').trim();
      if (newTitle.length > 40) newTitle = newTitle.slice(0, 40);
    }

    if (!newTitle) {
      newTitle = rawTitle.slice(0, 40);
    }

    return res.status(200).json({ title: newTitle });
  } catch (err) {
    console.error('summarizeTitle error:', err);
    return res.status(500).json({ message: 'Failed to generate title' });
  }
}


/**
 * POST /api/ai/generate-neutral
 * Body: { title?: string, description?: string }
 * Response: { title: string, description: string }
 */
export async function generateNeutralTitleAndDescription(req, res) {
  try {
    const rawTitle = (req.body?.title || '').toString().trim();
    const rawDescription = (req.body?.description || '').toString().trim();
    const userInput = rawTitle && rawDescription
      ? `TITLE:\n${rawTitle}\n\nDESCRIPTION:\n${rawDescription}`
      : (rawDescription || rawTitle);

    if (!userInput) {
      return res.status(400).json({ message: 'At least one of title or description is required' });
    }

    const systemPrompt = `You are an AI assistant for Disagreement.AI. Your sole function is to analyze a user's initial problem description and rewrite it into two distinct fields: a neutral, concise 'title' and a neutral, comprehensive 'description'.\n\n**CRITICAL DIRECTIVES:**\n1.  **Strict Neutrality:** The output MUST be strictly neutral, objective, and devoid of any biased, inflammatory, or emotionally loaded language.\n2.  **Title Length:** The 'title' field MUST be 40 characters or less.\n3.  **Description Length:** The 'description' field MUST be 1000 characters or less.\n4.  **JSON Format:** The output MUST be a single, valid JSON object with two keys: "title" and "description".\n5.  **No Extraneous Text:** Do not include any conversational text, markdown formatting, or anything outside of the single JSON object.\n\nThe user's text is a starting point. Your job is to refine it into a statement of fact that both parties can agree is a fair representation of the topic of disagreement.`;

    let content = '';
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0,
        max_tokens: 400,
      });
      content = (completion?.choices?.[0]?.message?.content || '').trim();
    } catch (aiErr) {
      console.error('OpenAI error (generateNeutralTitleAndDescription):', aiErr);
      // Fallback: use raw inputs minimally processed
      const fallbackTitle = (rawTitle || rawDescription).replace(/\s+/g, ' ').trim().slice(0, 80) || 'Disagreement';
      const fallbackDesc = (rawDescription || rawTitle).replace(/\s+/g, ' ').trim();
      return res.status(200).json({ title: fallbackTitle, description: fallbackDesc });
    }

    const parseJson = (text) => {
      try { return JSON.parse(text); } catch (_) { /* try to extract */ }
      try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          return JSON.parse(text.slice(start, end + 1));
        }
      } catch (_) {}
      return null;
    };

    const obj = parseJson(content) || {};
    let outTitle = (obj?.title || '').toString().trim();
    let outDesc = (obj?.description || '').toString().trim();

    if (!outTitle && rawTitle) outTitle = rawTitle;
    if (!outDesc && rawDescription) outDesc = rawDescription;
    if (!outTitle) outTitle = 'Disagreement';
    if (!outDesc) outDesc = '';

    // Enforce hard character limits per spec
    if (outTitle.length > 40) outTitle = outTitle.slice(0, 40);
    if (outDesc.length > 1000) outDesc = outDesc.slice(0, 1000);

    return res.status(200).json({ title: outTitle, description: outDesc });
  } catch (err) {
    console.error('generateNeutralTitleAndDescription error:', err);
    return res.status(500).json({ message: 'Failed to generate neutral title/description' });
  }
}

/**
 * POST /api/ai/check-neutrality
 * Body: { title: string, description: string }
 * Response: 200 { result: 'PASS' } | 400 { result: 'FAIL', message: '...' }
 */
export async function checkNeutrality(req, res) {
  try {
    const title = (req.body?.title || '').toString().trim();
    const description = (req.body?.description || '').toString().trim();
    const combined = [title, description].filter(Boolean).join('\n\n');

    if (!combined) {
      return res.status(400).json({ result: 'FAIL', message: 'Title and/or description are required.' });
    }

    if (!groq) {
      console.error('GROQ_API_KEY not set or Groq client not initialized.');
      // Fail closed per guardrail spec
      return res.status(400).json({ result: 'FAIL', message: 'The provided text does not meet neutrality standards.' });
    }

    const system = `You are a strict but fair AI content moderator. Your only job is to determine if the user's text is neutral and unbiased.

- If the text is neutral, objective, and appropriate for a formal disagreement, respond with the single word: PASS
- If the text contains personal attacks, insults, biased language, or is clearly inflammatory, respond with the single word: FAIL

Do not be overly sensitive. The goal is to prevent abuse, not to police tone. Only fail text that is overtly non-neutral. Respond with ONLY "PASS" or "FAIL".`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_GUARDRAIL_MODEL || 'llama-3.1-8b-instant',
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: combined },
      ],
    });

    // Debug: log the exact raw response from Groq for diagnostics
    console.log('--- GROQ GUARDRAIL RAW RESPONSE ---');
    try {
      console.log(JSON.stringify(completion, null, 2));
    } catch (e) {
      console.log(completion);
    }
    console.log('---------------------------------');

    const groqResponse = completion?.choices?.[0]?.message?.content;
    const decision = groqResponse && groqResponse.trim().toUpperCase();
    if (decision === 'PASS') {
      return res.status(200).json({ result: 'PASS' });
    }
    return res.status(400).json({ result: 'FAIL', message: 'The provided text does not meet neutrality standards.' });
  } catch (err) {
    console.error('checkNeutrality error:', err);
    return res.status(400).json({ result: 'FAIL', message: 'The provided text does not meet neutrality standards.' });
  }
}

// New AI service: Clarifying Introduction for AI Mediator
export async function getAIClarifyingIntroduction() {
  console.log('[STATIC] Returning the hardcoded DAI introduction message.');
  return `Hello, I am DAI. I am here to help you find a clear, mutual agreement.\n\nTo make this process fair and productive, please follow these three principles:\n\n1. 💯 Respect Each Other.\nFocus on the facts of the issue, not the person. Personal attacks, insults, and false statements are not permitted. My role is to keep this conversation respectful and productive.\n\n2. 💬 Write Your Opening Statement.\nYour first task is to present your full case to me. Be thorough: describe the events from your perspective and state what a fair and specific agreement looks like to you. The more detail you provide, the better I can understand your position.\n\n3. ➕ Add All Relevant Evidence.\nFacts provide clarity. Please use the upload feature to add any relevant documents, screenshots, or recordings that support your case. All information you share is confidential and will be permanently deleted 120 days after this case is closed.\n\n**How to Interact with Me:**\nTo ask me a direct question, start your message with @DAI.\nWhen you are ready for a solution, type @DAI Propose an Agreement.\n\n**Please begin with your opening statements.**`;
}

// AI Active Listening: Respond when users summon the mediator directly
export async function getAIResponseToSummon(messageHistory, summonText) {
  const history = Array.isArray(messageHistory) ? messageHistory : [];
  const systemPrompt = `You are an AI Mediator. You have been summoned by a user. Your task is to provide a neutral, helpful, and concise response to the user's last message.

You will be given the entire chat history for context, and the user's specific message that summoned you.

- Analyze the last few messages to understand the immediate context.
- Directly address the user's question or comment.
- Do NOT take sides.
- Your response should be aimed at clarifying the situation or encouraging constructive dialogue.
- Keep your response brief (2-3 sentences).`;

  // Format recent history as "Name: text" lines, newest last
  const MAX_MESSAGES = Number(process.env.AI_SUMMON_HISTORY_LIMIT || 30);
  const sanitize = (v) => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();
  const formattedHistory = history
    .slice(Math.max(0, history.length - MAX_MESSAGES))
    .map((m) => {
      const name = sanitize(m?.sender?.name || 'Participant');
      const txt = sanitize(m?.text || '');
      return `${name}: ${txt}`;
    })
    .join('\n');

  const userContent = `CHAT HISTORY (newest last):\n${formattedHistory || '(no prior messages)'}\n\nSUMMONING MESSAGE (from user):\n${sanitize(summonText)}\n\nPlease respond in 2-3 sentences.`;

  let content = '';
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_SUMMON_MODEL || process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 180,
    });
    content = (completion?.choices?.[0]?.message?.content || '').trim();
  } catch (e) {
    console.error('[AI] getAIResponseToSummon error:', e?.message || e);
  }

  if (!content) {
    // Conservative fallback, 2 short sentences.
    const txt = sanitize(summonText);
    content = txt
      ? `Thanks for the mention. I understand you're asking: "${txt.slice(0, 180)}${txt.length > 180 ? '…' : ''}". To move forward, could you clarify the key point you want addressed and what outcome you’d consider fair?`
      : 'Thanks for the mention. Could you share the key question you want addressed and what outcome you’d consider fair?';
  }

  return content;
}


// --- Toxicity Classification (Groq) ---
export async function classifyMessageToxicity(messageText) {
  try {
    const text = (messageText == null ? '' : String(messageText)).trim();
    if (!text) return 'NEUTRAL';

    if (!groq) {
      console.warn('GROQ_API_KEY not set or Groq client not initialized. Defaulting toxicity classification to NEUTRAL.');
      return 'NEUTRAL';
    }

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_GUARDRAIL_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            `You are a content classification AI. Analyze the user's message for its tone and intent. Classify it into one of three categories: NEUTRAL, NEGATIVE, or TOXIC. 
          - NEUTRAL: A standard, respectful message.
          - NEGATIVE: A message expressing frustration or disagreement, but not attacking a person.
          - TOXIC: A message containing personal insults, swearing, or aggressive, non-constructive language.
          Respond with only a single word: NEUTRAL, NEGATIVE, or TOXIC.`,
        },
        { role: 'user', content: text },
      ],
    });

    const classification = completion?.choices?.[0]?.message?.content?.trim().toUpperCase();
    return classification || 'NEUTRAL';
  } catch (error) {
    console.error('Error in classifyMessageToxicity:', error);
    return 'NEUTRAL';
  }
}


// AI Re-engagement: gentle nudge after inactivity (single, polite question)
export async function getAIReEngagementMessage(messageHistory) {
  try {
    const history = Array.isArray(messageHistory) ? messageHistory : [];
    const MAX = Number(process.env.AI_REENGAGE_HISTORY_LIMIT || 20);
    const sanitize = (v) => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();
    const formatted = history
      .slice(Math.max(0, history.length - MAX))
      .map((m) => `- ${sanitize(m?.text || '')}`)
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are an AI Mediator. The conversation has been inactive for a while. Your task is to write a brief, neutral, and open-ended message to encourage the participants to continue the discussion.

- Do not summarize the past conversation.
- Do not take a side.
- Your message should be a gentle nudge.

Examples:
- "Just checking in. Is there anything else either of you would like to add at this point?"
- "Is there another aspect of this issue we could explore?"
- "What are your current thoughts on the last point that was made?"

Keep your response to a single, polite question.`;

    const userContent = formatted
      ? `Recent chat lines (newest last):\n${formatted}\n\nWrite a single, polite question to re-engage the participants.`
      : 'Write a single, polite question to re-engage the participants.';

    let content = '';
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_REENGAGEMENT_MODEL || process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 80,
      });
      content = (completion?.choices?.[0]?.message?.content || '').trim();
    } catch (e) {
      console.error('[AI] getAIReEngagementMessage error:', e?.message || e);
    }

    if (!content) {
      // Safe fallback from examples (single polite question)
      content = 'Just checking in. Is there anything else either of you would like to add at this point?';
    }

    // Ensure it's a single line question; trim and enforce a question mark if missing
    content = content.replace(/\s+/g, ' ').trim();
    if (!/[?？]$/.test(content)) content = content + '?';
    return content;
  } catch (err) {
    console.error('getAIReEngagementMessage internal error:', err);
    return 'Just checking in. Is there anything else either of you would like to add at this point?';
  }
}


// AI Summarization: neutral summary of each participant's main points (v2.5)
export async function getAISummary(messageHistory) {
  try {
    const history = Array.isArray(messageHistory) ? messageHistory : [];
    const MAX = Number(process.env.AI_SUMMARY_HISTORY_LIMIT || 40);
    const sanitize = (v) => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();
    const formatted = history
      .slice(Math.max(0, history.length - MAX))
      .map((m) => {
        const name = sanitize(m?.sender?.name || 'Participant');
        const txt = sanitize(m?.text || '');
        return `${name}: ${txt}`;
      })
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are an AI Mediator. Your task is to read a conversation transcript and provide a brief, neutral summary of each participant's main points.

- Your summary must be impartial and objective. Do not take sides or inject your own opinions.
- Structure your response clearly, addressing each person's perspective. For example: "My understanding is that [User A's position]. On the other hand, [User B's position]."
- Conclude by asking a simple, direct question to confirm your understanding. For example: "Is this summary accurate?"
- Keep the entire message concise.`;

    const userContent = formatted
      ? `CONVERSATION TRANSCRIPT (newest last):\n${formatted}\n\nWrite a concise, neutral summary as specified.`
      : 'Write a concise, neutral summary as specified for an empty or minimal conversation.';

    let content = '';
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 220,
      });
      content = (completion?.choices?.[0]?.message?.content || '').trim();
    } catch (e) {
      console.error('[AI] getAISummary error:', e?.message || e);
    }

    if (!content) {
      // Conservative fallback phrasing following the spec
      const names = Array.from(new Set(history.map((m) => sanitize(m?.sender?.name)).filter(Boolean)));
      const a = names[0] || 'one participant';
      const b = names[1] || 'another participant';
      content = `My understanding is that ${a} has shared their perspective, and on the other hand, ${b} has offered a different view. Is this summary accurate?`;
    }

    // Trim whitespace and ensure concise length (soft limit)
    return content.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.error('getAISummary internal error:', err);
    return 'My understanding is that each of you has outlined different concerns. Is this summary accurate?';
  }
}

// --- Resolution Proposal (v3.0) ---
export async function getAIResolutionProposal(messageHistory) {
  try {
    const history = Array.isArray(messageHistory) ? messageHistory : [];
    const MAX = Number(process.env.AI_PROPOSAL_HISTORY_LIMIT || 60);
    const sanitize = (v) => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();
    const formatted = history
      .slice(Math.max(0, history.length - MAX))
      .map((m) => {
        const name = sanitize(m?.sender?.name || 'Participant');
        const txt = sanitize(m?.text || '');
        return `${name}: ${txt}`;
      })
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are an expert AI Mediator. Your task is to read an entire conversation transcript and generate a concise, neutral, and actionable resolution plan.

- Analyze all facts, evidence, and perspectives presented.
- Your proposal must be a clear, step-by-step plan that addresses the core of the disagreement.
- Do not assign blame. Focus only on the solution.
- The proposal should be written in a way that is fair to both parties.
- Keep the entire proposal under 100 words.`;

    const userContent = formatted
      ? `CONVERSATION TRANSCRIPT (newest last):\n${formatted}\n\nWrite a concise resolution proposal as specified.`
      : 'Write a concise resolution proposal as specified for a minimal conversation.';

    let content = '';
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_PROPOSAL_MODEL || process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 220,
      });
      content = (completion?.choices?.[0]?.message?.content || '').trim();
    } catch (e) {
      console.error('[AI] getAIResolutionProposal error:', e?.message || e);
    }

    if (!content) {
      // Conservative fallback: neutral 2-step plan under ~100 words
      content = 'Proposed path forward: 1) Each party lists their top two desired outcomes and any constraints in writing within 24 hours. 2) Identify the overlap and agree on one next concrete step with a clear owner and date. Does this seem fair to both of you?';
    }

    // Enforce ~100-word limit as a safety check
    const words = content.split(/\s+/).filter(Boolean);
    if (words.length > 100) {
      content = words.slice(0, 100).join(' ');
    }
    return content.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.error('getAIResolutionProposal internal error:', err);
    return 'Proposed path forward: 1) Share your top outcomes and constraints. 2) Agree on one concrete next step with an owner and date. Does this seem fair to both of you?';
  }
}
