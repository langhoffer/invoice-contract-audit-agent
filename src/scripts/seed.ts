import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';
import { Ollama } from 'ollama'; // <--- Import named class 'Ollama' instead of default

// Determine execution environment
const isLocal =
  process.env.USE_LOCAL_AI?.trim().replace(/['"]/g, '') === 'true';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize direct Ollama client for local embeddings
const ollamaClient = new Ollama({
  host:
    process.env.OLLAMA_BASE_URL?.replace('/api', '') ||
    'http://127.0.0.1:11434',
});

// Helper function to generate embedding vector regardless of provider
async function generateVector(text: string): Promise<number[]> {
  if (isLocal) {
    const response = await ollamaClient.embeddings({
      model: 'nomic-embed-text',
      prompt: text,
    });
    return response.embedding;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing while USE_LOCAL_AI is false.');
    }
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return embedding;
  }
}

// Sample Seed Data
const sampleRules = [
  {
    vendor_name: 'Acme Corp',
    rule_category: 'Payment Terms',
    content:
      'Payment terms are Net 30 days. Late payments incur a 1.5% monthly fee.',
  },
  {
    vendor_name: 'Acme Corp',
    rule_category: 'Billing Limit',
    content:
      'Maximum hourly rate for senior engineering consulting is capped at $150/hr.',
  },
  {
    vendor_name: 'CloudScale Inc',
    rule_category: 'Discounts',
    content:
      'Volume discount of 10% applies to all cloud infrastructure invoices over $5,000.',
  },
  {
    vendor_name: 'LogiTech Logistics',
    rule_category: 'Freight Charges',
    content:
      'All shipping fees must be prepaid by the vendor for orders exceeding $1,000.',
  },
];

async function seed() {
  console.log(`\n🌱 Starting database seeding pipeline...`);
  console.log(
    `Environment: ${isLocal ? 'LOCAL (Ollama Direct)' : 'CLOUD (OpenAI)'}`
  );

  // Clear existing contract rules to prevent duplicate entries
  console.log('🧹 Clearing old contract rules...');
  const { error: deleteError } = await supabase
    .from('contract_rules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

  if (deleteError) {
    console.error(
      '⚠️ Could not clear existing table rows:',
      deleteError.message
    );
  }

  for (const rule of sampleRules) {
    console.log(
      `\nGenerating embedding for: [${rule.vendor_name}] - ${rule.rule_category}`
    );

    try {
      const embedding = await generateVector(rule.content);

      console.log(
        ` Vector generated successfully (${embedding.length} dimensions)`
      );

      const { error } = await supabase.from('contract_rules').insert({
        vendor_name: rule.vendor_name,
        rule_category: rule.rule_category,
        content: rule.content,
        embedding,
      });

      if (error) {
        console.error(
          `❌ Failed to insert rule into Supabase: ${error.message}`
        );
      } else {
        console.log(`✅ Saved rule to Supabase for ${rule.vendor_name}`);
      }
    } catch (err: any) {
      console.error(
        `❌ Error during embedding generation:`,
        err?.message || err
      );
    }
  }

  console.log('\n🎉 Seeding execution complete!');
}

seed().catch((err) => {
  console.error('Fatal seed script failure:', err);
  process.exit(1);
});
