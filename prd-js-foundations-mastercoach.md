# PRD — JS Foundations MasterCoach (V0)

## 1) Product Summary

A small web app that helps learners master **JavaScript fundamentals** via **Diagnostic → Learn Card → 3-Question Quiz → Mastery Gate (≥85%)**. The app offers **plain-language, kid-speak hints** on demand. **AI never grades**; grading is deterministic from fixed answer keys.

**V0 Topics**

1. Variables & Types
2. Arrays & Objects
3. Loops & Conditionals

**Primary Outcome**
Learner reaches **≥85%** on a 3-question quiz for a topic within **≤2 sessions**.

---

## 2) In/Out of Scope (V0)

**In scope**

* One language: **JavaScript**
* Flow: **Home → Diagnostic (3) → Learn Card → Quiz (3) → Results (score + explanations) → Mastery Gate**
* Content file: **`/data/questions.json`** (9 items total; 3 per topic)
* **AI hint endpoint**: `POST /api/hint` returns short beginner-tone explanations (stub or real model)
* Core helpers (TS) + tests: `lib/score.ts`, `lib/mastery.ts`, `lib/nextQuestion.ts`
* Next.js (App Router) + TypeScript + Tailwind
* **Demo Mode** (no backend) — “Try demo” button (details in §8)
* Vercel deploy
* README with run steps, screenshots, live URL

**Out of scope (V0)**

* Accounts, server persistence, analytics
* Executing arbitrary user code
* Additional topics/languages

---

## 3) Acceptance Criteria

1. **End-to-end flow** per topic:

   * Diagnostic (3) routes to Learn for weak concepts
   * Learn Card shows concept, tiny example, **Show hint** (static), **Explain differently** (AI)
   * Quiz (3) computes score, shows **whyWrong** for incorrect choices
   * **Mastery Gate**: cannot advance until `mastery ≥ 0.85` (average of last ≤3 quiz scores for that topic)

2. **AI hint**

   * `POST /api/hint` with `{ topic, prompt, wrongChoice? }` → `{ hint: string }`
   * Responds in ≤2s; if no model configured, return deterministic fallback text

3. **Unit tests** pass

   * `scoreQuiz` (3/3, 2/3, 0/3)
   * `masteryAverage` / `isMastered` (0.84 → false; 0.85 → true)
   * `nextQuestion` skips mastered; returns `null` if all mastered

4. **Demo Mode (no backend)**

   * Clicking **“Try demo”** sets a local demo flag, seeds sample mastery in `localStorage`, and shows a **Demo User** badge
   * **Reset demo** clears local data and returns to a clean slate
   * App works fully without any env vars/backend

5. **Vercel deploy**

   * Renders on desktop & mobile
   * Keyboard accessible; visible focus styles

---

## 4) Information Architecture & Files

```
/app
  /page.tsx               # Home (topic selection + simple progress + header actions)
  /diagnostic/page.tsx    # 3-question diagnostic
  /learn/page.tsx         # Learn card with hints
  /quiz/page.tsx          # Quiz + results + mastery gate
  /api/hint/route.ts      # POST: {topic, prompt, wrongChoice?} -> {hint}
  /components/DemoMode.tsx# Demo button (local demo session toggle)
/data/questions.json      # 9 items total (3 per topic)
/lib/score.ts
/lib/mastery.ts
/lib/nextQuestion.ts
/__tests__/core.test.ts   # Vitest/Jest tests for helpers
/app/globals.css          # Tailwind base + small design tokens
/README.md
```

**Routing/state**

* Topic via query param (e.g., `?topic=variables_types`)
* Diagnostic stores weak topics in client state (Context or URL state)
* No server persistence in V0 (Demo Mode uses `localStorage` only)

---

## 5) Data Model (for `/data/questions.json`)

Each item:

```json
{
  "id": 1,
  "topic": "variables_types",
  "prompt": "Question text",
  "choices": ["A","B","C","D"],
  "answerIndex": 0,
  "hint": "Short nudge (≤120 chars)",
  "whyWrong": "Concise explanation of why the wrong choices are wrong and the right one is right."
}
```

V0 requires **9 items total**: **3 per topic** (`variables_types`, `arrays_objects`, `loops_conditionals`).

---

## 6) Helper Functions (signatures & behavior)

**`lib/score.ts`**

```ts
export function scoreQuiz(answers: number[], key: number[]): number;
// returns correct/total; if lengths differ, return 0
```

**`lib/mastery.ts`**

```ts
export function masteryAverage(lastScores: number[], window?: number): number;
// average of last N scores (default 3); empty -> 0

export function isMastered(lastScores: number[], threshold?: number, window?: number): boolean;
// default threshold = 0.85, window = 3
```

**`lib/nextQuestion.ts`**

```ts
export type Q = { id: number; topic: string };
export function nextQuestion(candidates: Q[], masteredIds: Set<number>): Q | null;
// first candidate not in masteredIds; null if all mastered
```

---

## 7) API — AI Hint (stub acceptable)

**Route:** `POST /api/hint`
**Request body:**

```json
{ "topic": "arrays_objects", "prompt": "Question prompt text", "wrongChoice": 0 }
```

**Response body:**

```json
{ "hint": "Short kid-speak analogy or plain-language explanation (2–4 sentences)." }
```

**Model system prompt (if configured):**
“You are a friendly JavaScript tutor. Explain concepts using plain language and kid-speak analogies. Keep responses to 2–4 sentences. Never say an answer is correct/incorrect; only explain the idea another way.”

**Timeout & fallback:** If call >2s or unavailable, return a prewritten hint string for the `topic`.

---

## 8) UI/UX Spec (V0) — includes **Demo Mode**

**Visual goals**: clean, minimal, accessible; Tailwind only; system fonts; single-column mobile, centered `max-w-2xl` desktop.

**Design tokens (`/app/globals.css`)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-white text-gray-900 antialiased; }
.container-narrow { @apply max-w-2xl mx-auto px-4; }
.card { @apply rounded-2xl border border-gray-200 shadow-sm bg-white; }
.btn { @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600; }
.btn-primary { @apply bg-blue-600 text-white border-transparent hover:bg-blue-700 active:bg-blue-800; }
.btn-ghost { @apply border-transparent hover:bg-gray-50; }
.input-radio { @apply h-4 w-4 text-blue-600 focus:ring-blue-600; }
.badge { @apply inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700; }
```

**Shared header & footer**

* **Header**: left **JS MasterCoach**; right actions: progress string + **DemoMode** component

  * When demo is on: show **“Demo User”** badge + **Reset demo** button
  * When demo is off: show **Try demo** button
* **Footer**: `V0 • Deterministic grading • Hints only`

**Screens**

* **Home `/`**: Title “Choose a topic”; 3 topic buttons; “Take diagnostic”; progress badges
* **Diagnostic `/diagnostic`**: “Quick diagnostic (3 questions)”; radios; Next/Submit; result toast; “Go to learn”
* **Learn `/learn?topic=…`**: badge + title; 1–2 sentence concept; tiny inline code; “Show hint” (static), “Explain differently” (AI), “Go to quiz”
* **Quiz `/quiz?topic=…`**: 3 MCQs; Submit; Results: `You scored {n}/3 ({pct}%).` + list wrong with `whyWrong`; buttons “Retry missed”, “Back to learn”; **Advance** button disabled until mastery true

  * Disabled text: `Advance (need ≥ 85% mastery)`
  * Helper: `Mastery {pct}% — retry missed questions.`

**Accessibility**

* Tab through all controls; visible focus rings
* Radios labeled via `id`/`htmlFor`
* Semantic landmarks (`<main>`, `<header>`)

**Copy deck (exact strings)**

* Home: `Choose a topic` / `Take diagnostic`
* Diagnostic: `Quick diagnostic (3 questions)` / `Next` / `Submit` / `You’re strongest in {A}; let’s focus on {B}.` / `Go to learn`
* Learn: `Show hint` / `Explain differently` / `Go to quiz`
* Quiz: `Submit` / `Retry missed` / `Back to learn` / `You scored {n}/3 ({pct}%).`
* Gate: `Advance (need ≥ 85% mastery)` / `Mastery {pct}% — retry missed questions.`
* Error: `Couldn’t load questions. Try refreshing.`
* Demo: `Try demo` / `Demo User` / `Reset demo`

**Demo Mode behavior (implementation guidance)**

* Component: **`/app/components/DemoMode.tsx`**
* On **Try demo**: set `localStorage.demo = 'true'` and seed:

  ```json
  { "variables_types": 0.67, "arrays_objects": 0.33, "loops_conditionals": 0 }
  ```

  then reload or navigate to Home
* On **Reset demo**: remove those keys and reload
* Progress UI reads mastery from state; if `localStorage.mastery` exists, hydrate from it on load

---

## 9) Testing (V0)

* `scoreQuiz`: 1, 2/3, 0 results
* `masteryAverage` & `isMastered`: 0.84 false, 0.85 true; window behavior
* `nextQuestion`: first non-mastered; `null` if all mastered

---

## 10) Deployment (Vercel)

* Push repo to GitHub
* Import in Vercel (Next.js) → build & deploy
* Add live URL + screenshots to `/README.md`

---

## 11) Definition of Done (V0)

* Flow works (Diagnostic → Learn → Quiz → Results → **Mastery Gate**) for all 3 topics
* `/data/questions.json` contains **9 items** with `hint` and `whyWrong`
* `/api/hint` returns helpful text (stub or model) within 2s (or fallback)
* **Demo Mode** works: Try demo toggles local session, Demo User badge shows, Reset demo clears
* Helpers + tests implemented and passing
* Deployed to Vercel; README includes run steps, screenshots, live URL
* Keyboard-accessible UI with visible focus states

---

## 12) Cursor commands

**Generate tasks**

```
Use @prd-js-foundations-mastercoach.md and create tasks with @ai-dev-tasks/generate-tasks.md. Include both logic and UI acceptance from the PRD.
```

**Process tasks**

```
Start on task 1.1 using @ai-dev-tasks/process-task-list.md. After each task, show the diff and wait for my approval.
```

---

If you want, I can also give you the ready-to-paste **`/data/questions.json` (9 items)** again here, or we can jump to “Generate tasks” in Cursor now.
