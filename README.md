# ⛩️ JS Sensei

Train your JavaScript fundamentals in our interactive dojo.  
Level up from white belt to black belt with practice quizzes, flashcards, and one-on-one tutelage from our AI Sensei.

---

## 🚀 Live Demo
[**View Live App on Vercel**](https://your-vercel-url.vercel.app)  
*(Demo mode available — explore topics without an account!)*

---

## ✨ Features
- **Topic Coverage**
  - Variables & Types
  - Arrays & Objects
  - Loops & Conditionals
  - Functions
  - Must-Know Methods (map, filter, reduce)
  - Async/Await
  - APIs & Event Loop
  - JS Intro
- **Diagnostic Test** → Quickly find your weakest topic
- **Learn Pages**
  - Explanations, code examples
  - “Show Hint” and “Explain Differently” buttons
  - Ask Tutor — AI-powered Q&A
- **Quizzes** → Per-topic multiple choice, mastery tracking
- **Flashcards** → Review built-in cards or add your own (+XP)
- **Gamification**
  - XP system with belt ranks (🥋 White → Black)
  - Toast notifications on actions (e.g., +20 XP for adding flashcards)
- **Authentication**
  - GitHub sign-in with Supabase
  - Demo mode (no account needed)

---

## 🛠 Tech Stack
- [Next.js 14 (App Router)](https://nextjs.org/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + Postgres for XP/Belts)
- Google Gemini API (AI hints + tutor)
- [Vercel](https://vercel.com/) (hosting & deployment)

---

## 📸 Screenshots
*(Add images in `/public` and update paths below)*

![Landing Page](./public/screenshot-landing.png)
![Topics](./public/screenshot-topics.png)
![Learn Page](./public/screenshot-learn.png)
![Quiz](./public/screenshot-quiz.png)

---

## 🏗 Project Structure
web/
app/
page.tsx # Landing page
topics/page.tsx # Topics overview
learn/page.tsx # Learn view (AI + hints)
quiz/page.tsx # Quiz view
flashcards/page.tsx # Flashcards (browse + add)
api/hint/route.ts # AI hint endpoint
data/questions.json
lib/ # helpers for scoring/mastery
styles/globals.css


---

## ⚙️ Local Development

# clone repo
git clone https://github.com/your-username/js-sensei.git
cd js-sensei/web

# install deps
npm install

# copy env file and fill it
cp .env.local.example .env.local

# run dev server
npm run dev

## 🔑 Environment Variables

Create a .env.local in /web with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Note:
Add your Vercel URL to Supabase Auth “Site URL” + “Redirect URLs”.
For GitHub sign-in, callback URL must be:
https://<your-project-ref>.supabase.co/auth/v1/callback

## 🚀 Deployment

Push repo to GitHub.
Import into Vercel.
Root Directory: web
Framework: Next.js
Add env vars (same as .env.local).

After first deploy:
Add production URL to Supabase Auth settings.
Update NEXT_PUBLIC_SITE_URL to the production domain in Vercel settings.

Redeploy and enjoy 🎉

## 📌 Roadmap

Progress bar for XP → next belt
Confetti on belt rank-up
Streaks and daily challenges
Dark mode dojo theme
PWA support

## 📄 License: MIT
