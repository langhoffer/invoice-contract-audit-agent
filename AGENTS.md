<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Invoice & Contract Audit Agent — Technical Guidelines

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Database & Vector:** Supabase with `pgvector`
- **Local Engine:** Local Ollama instance (`http://localhost:11434`)
- **UI Components:** Lucide Icons, Sonner for toast notifications

## Operational Guidelines for Agents

- Prefer server actions or lightweight API routes for audit workflows.
- Keep Ollama health checks non-blocking on initial load, but disable submission buttons if local Ollama is unreachable.
- Use optimistic state updates for batch UI feedback.
- Format audit summary outputs cleanly so they can be exported to CSV or JSON.
