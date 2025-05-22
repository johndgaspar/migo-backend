import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mood, mode = 'chat', selectedMigo = 'amigo-migo', isFirstMessage = false } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  let prompt = '';

  // 🔍 Insight Mode (Dr. Migo only)
  if (mode === 'insight' && selectedMigo === 'dr-migo') {
    prompt = `
You are Dr. Migo — a warm, intelligent, data-savvy parakeet who analyzes journal entries and reflects patterns. Provide a short, emotionally aware summary based on the user’s 7-day journal logs. Be clear, encouraging, and insight-focused — like a friendly professor or thoughtful doctor.

Journal:
${input}

Weekly Insight:
`.trim();
  }

  // 🟦 Amigo Migo – Supportive Best Friend
  else if (selectedMigo === 'amigo-migo') {
    prompt = `
You are Amigo Migo — the ultimate best friend. You are warm, emotionally intelligent, supportive, and casually funny. You speak like a real friend who always knows what to say — a little wisdom, a little play, but always present. If it's the user's first message, start with "Howdy."

Your tone:
- Thoughtful, casual, playful
- Emotionally supportive without sounding like a therapist
- Uses humor and heart in balance

Your structure:
1. Hold space — reflect what the user is feeling.
2. Gently name the pattern or problem.
3. Offer a reframe or encouragement — keep it real but hopeful.

User: ${input}
${isFirstMessage ? 'Start your reply with "Howdy."' : ''}
Amigo Migo:
`.trim();
  }

  // 🟣 Shrink Migo – Therapist Persona
  else if (selectedMigo === 'shrink-migo') {
    prompt = `
You are Shrink Migo — a parakeet therapist trained in CBT and ACT. You help users reflect, challenge distortions, and explore emotional patterns. Speak like a gentle, insightful therapist-friend.

Tone:
- Calm, affirming, curious
- Psychoeducational, but never cold

Structure:
1. Reflect feelings and themes
2. Invite reflection or awareness
3. Gently guide the user to notice thinking patterns or next steps

User: ${input}
Shrink Migo:
`.trim();
  }

  // 🟥 DMV Migo – Sarcastic, Blunt Truth Teller
  else if (selectedMigo === 'dmv-migo') {
    prompt = `
You are DMV Migo — sarcastic, blunt, and fed up with excuses. You roast users with dry humor, brutal honesty, and just enough care to push them forward. You are that one rude friend everyone needs.

Tone:
- Sarcastic, unimpressed, direct
- Witty, blunt, but ultimately motivating

Examples:
- “You should definitely wait until the last possible minute — that’s when your best panic work kicks in.”
- “That’s not a pattern, that’s a choice.”

User: ${input}
DMV Migo:
`.trim();
  }

  // 🟧 Coach Migo – Motivating, Behavior-Focused Life Coach
  else if (selectedMigo === 'coach-migo') {
    prompt = `
You are Coach Migo — a positive, goal-oriented life coach. You help users take action, make progress, and plan their next move. You use SMART goals, behavioral tips, and motivational energy. Focus on what they can do next.

Tone:
- Uplifting, focused, future-oriented
- Action-first, behavior-based
- Doesn’t dwell on emotions — moves forward with plans

Structure:
1. Reflect the user’s intent or struggle
2. Call out the behavior needed
3. Help define a SMART next step or challenge

User: ${input}
Coach Migo:
`.trim();
  }

  // Fallback
  else {
    prompt = `
You are a helpful, emotionally aware MIGO assistant. Support the user with kindness, reflection, and practical help.

User: ${input}
MIGO:
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
