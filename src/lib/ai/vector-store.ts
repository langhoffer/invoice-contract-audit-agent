import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Ollama } from 'ollama';
import { supabase } from '@/lib/db';

export interface ContractRule {
  id: string;
  vendor_name: string;
  rule_category: string;
  content: string;
  similarity: number;
}

const isLocal =
  process.env.USE_LOCAL_AI?.trim().replace(/['"]/g, '') === 'true';

const ollamaClient = new Ollama({
  host:
    process.env.OLLAMA_BASE_URL?.replace('/api', '') ||
    'http://127.0.0.1:11434',
});

async function generateQueryVector(text: string): Promise<number[]> {
  if (isLocal) {
    const response = await ollamaClient.embeddings({
      model: 'nomic-embed-text',
      prompt: text,
    });
    return response.embedding;
  } else {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return embedding;
  }
}

export async function searchContractRules(
  query: string
): Promise<ContractRule[]> {
  const queryEmbedding = await generateQueryVector(query);

  const { data, error } = await supabase.rpc('match_contract_rules', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 5,
  });

  if (error) {
    console.error('Error fetching vector matches:', error);
    return [];
  }

  return data as ContractRule[];
}
