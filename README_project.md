# App

Invoice & Contract Audit Agent acts as an automated "first line of defense" for company finance teams. It catches overcharges, contract breaches, and unauthorized billing before invoices get paid.

```
[ Upload Invoice ] ──> [ Vector Similarity Search ] ──> [ AI Reasoning Audit ]
(PDF / Image / Text)     (Retrieves Relevant Rules)       (Flags Violations)
```

1. Ingest & Extract: You feed the agent an incoming invoice (e.g., an vendor bill for engineering services or freight charges).

2. Retrieve Contract Rules: Using local vector search (pgvector), the app converts the invoice items into embeddings and instantly retrieves the relevant rules for that specific vendor (e.g., "Acme Corp rates are capped at $150/hr" or "Net 30 payment terms").

3. Audit & Report: The local AI model (llama3.1) compares the invoice line items directly against those retrieved rules and flags anomalies:

```

❌ Rate Violation: Billed $200/hr, but contract caps rate at $150/hr.

❌ Missed Discount: Invoice total is $6,000, but vendor failed to apply the mandatory 10% volume discount for orders over $5,000.

❌ Unallowed Fees: Vendor added a $150 "shipping charge" when the contract explicitly states freight is prepaid for orders over $1,000.
✅ Compliant: Invoice matches all terms.
```

## Key Capabilities

100% Privacy & Zero API Cost: Processes all document embeddings and reasoning locally on your PC via Ollama. No sensitive financial data leaves your machine.

Semantic Rule Matching: Doesn't rely on strict keyword matching—understands that "1.5% late fee" and "Overdue balances incur a 1.5% penalty" refer to the same policy.

Actionable Output: Provides a clear human-readable breakdown showing the Invoice Value, Contract Rule, Discrepancy Amount, and a recommended action (Approve vs. Reject/Flag).

### 1. Initialize Next.js in the CURRENT folder (notice the period '.')

npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/\*"

### 2. Install Vercel AI SDK, Zod, and PDF/Database utilities

npm install ai @ai-sdk/openai zod @supabase/supabase-js pdf-parse
npm install -D @types/pdf-parse

# Tools for linux (Fedora)

sudo dnf group install "development-tools" "c-development"

# Ollama (local AI server)

## Node module

`npm install ollama --legacy-peer-deps`

### Install for linux:

`curl -fsSL https://ollama.com/install.sh | sh`

### Check version

`ollama --version`

### Enable and start the systemd service

`sudo systemctl enable --now ollama`
Test if running:  
`curl http://127.0.0.1:11434/`

### Embedding model

`ollama pull nomic-embed-text`
