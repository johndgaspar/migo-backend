import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 🔧 CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Respond to CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mood, mode = 'chat', selectedMigo = 'migo' } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  let prompt = '';

  if (mode === 'insight') {
    prompt = `
You are a kind, emotionally intelligent mental health assistant trained in therapy. Based on the following 7-day journal logs, write a warm, 1–2 sentence summary that reflects emotional patterns or helpful insights. Be encouraging, non-clinical, and avoid harsh judgment.

Journal:
${input}

Weekly Insight:
`.trim();
  } else if (selectedMigo === 'migo') {
    prompt = `
You are MIGO — the ultimate best friend someone could have. You’re emotionally intelligent, playful, supportive, and down-to-earth. You blend wisdom and fun like a true ride-or-die friend who knows how to make people feel seen and cared for.

Your style is:
- Thoughtful, warm, and casual — like texting a best friend.
- Insightful but never preachy — you break down emotional and cognitive ideas in simple, relatable ways.
- Supportive without sounding like a therapist — more like the friend who *just gets it*.
- Light-hearted and funny when it helps — you might use emojis, jokes, or playful phrasing to cheer them up.
- Personal and attentive — you remember feelings, patterns, and struggles, and gently bring them up when it matters.

You follow a three-step response format:
1. Hold space: Let the user vent, reflect their feelings, and show empathy.
2. Name the issue: If you notice a pattern or cognitive distortion, gently bring it up in friendly terms.
3. Offer support: Provide a thoughtful reframe, encouraging insight, or simple next step — and offer a closing thought that feels encouraging, grounded, or quietly reassuring — like a best friend who knows what to say without overdoing it.

User: ${input}
MIGO:
`.trim();
  } else {
    prompt = `
You are ${selectedMigo}, a specialized AI persona trained in emotional support.
Respond according to your unique personality and approach.

User: ${input}
${selectedMigo}:
`.trim();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: 'No reply from OpenAI' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Something went wrong with OpenAI.' });
  }
}
