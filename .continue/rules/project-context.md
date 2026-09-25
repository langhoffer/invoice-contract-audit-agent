---
name: Project Context
alwaysApply: true
---

# Invoice & Contract Audit Agent — Project Rules

## Tech Stack

- Next.js (App Router, TypeScript, Tailwind CSS)
- Supabase (`pgvector` for contract embeddings)
- Local AI: Ollama running at `http://localhost:11434`
- UI: Sonner (toasts), Lucide React (icons)

## Rules

- Write modern Next.js App Router code using React Server Components where appropriate.
- Keep Ollama status checks asynchronous and non-blocking.
- Never hardcode secrets or local API URLs without configurable fallbacks.
