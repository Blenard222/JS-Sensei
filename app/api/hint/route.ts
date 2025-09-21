import { NextRequest, NextResponse } from 'next/server';

// Deterministic fallback hints for each topic
const FALLBACK_HINTS: Record<string, string> = {
  variables_types: `Variables are like labeled boxes where you store different types of information. Think of them as containers that can hold numbers, text, or other data. Each container has a unique name so you can easily find and use what's inside.`,
  arrays_objects: `Arrays are like lists of items, and objects are like labeled containers with multiple compartments. Imagine an array as a train with many cars, and an object as a toolbox with labeled drawers.`,
  loops_conditionals: `Loops help you repeat actions, like a robot following steps over and over. Conditionals are decision points—like traffic lights—that choose which path the code takes based on a condition.`,
  functions: `Functions are like special recipes that do a specific job. You can create a function that takes ingredients (inputs), follows a set of steps, and serves up a result (output).`,
  methods_core: `Methods are like built-in superpowers for arrays and objects. They help you transform, filter, and play with your data in cool ways.`,
  async_await: `Async/await is like ordering food at a restaurant. You place an order (async function) and wait for it to arrive without stopping everything else.`,
  apis_event_loop: `The event loop is like a busy traffic controller, managing when and how different tasks get processed in JavaScript.`,
  intro_js: `JavaScript is the magic language that makes websites interactive, like adding special effects to a comic book.`
};

export async function POST(request: NextRequest) {
  try {
    const { topic, prompt, wrongChoice } = await request.json();

    // Gemini provider
    if (process.env.GEMINI_API_KEY) {
      const response = await Promise.race([
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `You are a friendly JS tutor. Topic: ${topic}. Style: kid-friendly. Level: beginner. Question: ${prompt}${wrongChoice !== undefined ? ` They chose option ${wrongChoice}.` : ''}. Respond in 2–5 short sentences with kid-speak analogies and no code unless necessary.`
              }]
            }]
          })
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]) as Response;

      const data = await response.json();
      const hint = data.candidates?.[0]?.content?.parts?.[0]?.text || FALLBACK_HINTS[topic];

      return NextResponse.json({ hint }, { status: 200 });
    }

    // Fallback to deterministic hints
    return NextResponse.json({ 
      hint: FALLBACK_HINTS[topic] || 'No specific hint available.' 
    }, { status: 200 });
  } catch (error) {
    // Any error falls back to deterministic hint
    console.error('Hint generation error:', error);
    return NextResponse.json({ 
      hint: FALLBACK_HINTS[topic] || 'No specific hint available.' 
    }, { status: 200 });
  }
}
