import { NextResponse } from 'next/server';

type HintBody = {
  topic?: string;
  prompt?: string;
  wrongChoice?: string | null;
};

const FALLBACK_HINTS: Record<string, string> = {
  variables_types:
    'Variables are like labeled boxes that hold values. Use const when it never changes, let when it might.',
  arrays_objects:
    'Arrays are ordered lists; objects are labeled compartments. Use [] for arrays and {} for objects.',
  loops_conditionals:
    'Conditionals pick a path (if/else). Loops repeat work (for/while) until a condition changes.',
  functions:
    'Functions are reusable recipes. Give them inputs (parameters) and return results.',
  methods_core:
    'map transforms, filter selects, reduce folds values into one. Practice on small arrays.',
  async_await:
    'async/await lets you write asynchronous code that reads top-to-bottom. await pauses until a promise resolves.',
  apis_event_loop:
    'The event loop queues callbacks so long tasks don’t block. Timers and fetch complete later on the queue.',
  intro_js:
    'JavaScript runs in the browser and on servers (Node). It’s dynamically typed and great for interactivity.',
};

export async function POST(req: Request) {
  let body: HintBody = {};
  try {
    body = (await req.json()) as HintBody;
  } catch {
    /* ignore */
  }

  const t = typeof body.topic === 'string' ? body.topic : 'variables_types';
  const userPrompt =
    typeof body.prompt === 'string' && body.prompt.trim().length > 0
      ? body.prompt.trim()
      : 'Explain this topic simply with a kid-friendly analogy and one short code example.';
  const wrongChoice = typeof body.wrongChoice === 'string' ? body.wrongChoice : null;

  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json(
      {
        hint:
          (wrongChoice ? `Think about why "${wrongChoice}" doesn’t match the concept. ` : '') +
          (FALLBACK_HINTS[t] || FALLBACK_HINTS.variables_types),
      },
      { status: 200 }
    );
  }

  try {
    const prompt = [
      'You are JS Sensei, a patient JavaScript tutor.',
      'Explain the topic in 3–5 sentences with a kid-friendly analogy and a tiny, valid JS example.',
      wrongChoice ? `The learner chose: "${wrongChoice}". Address that misconception.` : '',
      `Topic: ${t}`,
      `Question/Prompt: ${userPrompt}`,
    ]
      .filter(Boolean)
      .join('\n');

    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
        geminiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!resp.ok) throw new Error(`Gemini error: ${resp.status}`);

    const json = await resp.json();
    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      (FALLBACK_HINTS[t] || FALLBACK_HINTS.variables_types);

    return NextResponse.json({ hint: text }, { status: 200 });
  } catch (error) {
    console.error('Hint generation error:', error);
    return NextResponse.json(
      {
        hint:
          (wrongChoice ? `Think about why "${wrongChoice}" doesn’t match the concept. ` : '') +
          (FALLBACK_HINTS[t] || FALLBACK_HINTS.variables_types),
      },
      { status: 200 }
    );
  }
}
