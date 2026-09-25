# Invoice & Contract Audit Agent — Technical Guidelines

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Database & Vector Store:** Supabase with `pgvector`
- **Local Engine:** Ollama running locally at `http://localhost:11434`
- **UI Components:** Lucide Icons, Sonner for toast notifications

## Operational Guidelines

- Prefer server actions or lightweight API routes for audit workflows.
- Keep local Ollama health checks non-blocking on initial load, but disable trigger buttons if local Ollama is unreachable.
- Use optimistic state updates for UI feedback during heavy batch processes.
- Format audit summary outputs as clean data arrays to enable browser-side CSV export.
