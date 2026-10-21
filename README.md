# Invoice & Contract Audit Agent

A full-stack, enterprise-grade application designed for automated invoice auditing, rule validation, and batch processing. Built with performance, security, and developer experience in mind.

## 🛠️ Tech Stack & Architecture

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **AI Engine:** Dual-mode processing (Local Ollama / OpenAI API)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Sonner (Toast notifications)
- **Type Safety:** TypeScript

## ✨ Key Features

- **Automated Invoice Auditing:** Upload and parse invoice data against custom rule sets.
- **Dual AI Inference:** Hybrid support for local offline LLMs (Ollama) or cloud fallback (OpenAI).
- **Batch Processing:** Handle bulk files with status feedback and error handling.
- **Row-Level Security (RLS):** Strict multi-tenant data access control at the database level.
- **Optimized UX:** Smooth, non-blocking toast notifications (`sonner`) replacing intrusive browser alerts.

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js 18+** and **npm/pnpm** installed.

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Toggle between local AI ('true') and OpenAI ('false')
USE_LOCAL_AI="true"

# Local Ollama Endpoint
OLLAMA_BASE_URL="http://127.0.0.1:11434/api"

# OpenAI Credentials
OPENAI_API_KEY="your-openai-api-key"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 3. Installation & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🔒 Security Highlights

- **Database Safety:** All PostgreSQL tables enforce strict Row-Level Security (RLS) policies.
- **Server-Only Credentials:** Service role keys and API credentials are kept strictly on the server side using Next.js `'use server'` actions.

© 2026. All rights reserved.
