import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const user = `Rewrite the following into one neutral, concise sentence (max ~25 words). Use plain language.

TEXT:\n${description}`;

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
