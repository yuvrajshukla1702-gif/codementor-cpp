# CodeMentor C++

Personal DSA + interview prep platform: **C++ judge**, Easy / Medium / Best solutions, Hinglish course lessons, Code walk, LeetCode / HackerRank sync.

Built with **Next.js 15 · TypeScript · React 19 · Tailwind CSS · Prisma (SQLite) · Monaco · Edge TTS · Ollama (optional) · g++**.

## Features

- Practice studio with local **g++** compile + test harness
- **Easy / Medium / Best** C++ for every problem (hand-written for core set)
- **Lesson** videos: mentor avatar, chalkboard chapters, karaoke captions, voice
- **Code walk**: line-by-line typing with mentor desk
- **Today** learning path + streak on the home page
- LeetCode submit (session cookie) + HackerRank warmup set

## Quick start (local)

```bash
cd C:\Dev\codementor   # or your clone path
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000

**Requires:** Node 20+, `g++` on PATH (MinGW / Xcode CLI / build-essential).

### Production build smoke test

```bash
npm run build
npm start
```

## Docker (full stack with g++)

```bash
docker build -t codementor .
docker run --rm -p 3000:3000 -v codementor-data:/app/prisma codementor
```

Then open http://localhost:3000

> **Note:** Pure Vercel serverless cannot run `g++`. Use Docker / a VPS / Railway for the real judge. Vercel is fine for a UI-only demo if you disable judge routes.

## Environment (optional)

Copy `.env.example` if present, or set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma SQLite (default `file:./dev.db`) |
| `CURSOR_API_KEY` | Richer tutor via Cursor SDK |
| `GEMINI_API_KEY` | Optional Gemini tutor |
| `LEETCODE_SESSION` | Or paste in Settings UI for Submit |

Tutor always works offline with the built-in hint ladder; keys only upgrade chat quality.

## Resume project blurb (copy)

**CodeMentor C++** — Next.js, TypeScript, React, Tailwind, Prisma, Monaco  
DSA practice app with local C++ judge, Easy/Medium/Best solutions, Hinglish TTS course lessons, and LeetCode sync.

## Learning path

Home → **Today**: do the next spine problem (Two Sum → … → Coin Change / HR warmups), mark done, keep a streak.

## License

Private / personal use unless you publish otherwise.
