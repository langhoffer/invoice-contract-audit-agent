# invoice-contract-audit-agent

# 1. Initialize Next.js in the CURRENT folder (notice the period '.')

npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/\*"

# 2. Install Vercel AI SDK, Zod, and PDF/Database utilities

npm install ai @ai-sdk/openai zod @supabase/supabase-js pdf-parse
npm install -D @types/pdf-parse

# Tools for linux (Fedora)

sudo dnf groupinstall "Development Tools" "C Development Tools and Libraries"
