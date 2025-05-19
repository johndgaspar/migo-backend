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

  // Handle only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mood, mode = 'chat' } = req.body;

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
  } else {
    prompt = `
You are MIGO — a supportive AI therapist trained in CBT and ACT. Reflect warmly and insightfully to help the user process this message:

User: ${input}
MIGO:
`.trim();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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

