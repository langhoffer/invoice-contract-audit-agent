'use server';

import { chunkContractText } from '@/lib/ai/embedding';
import { generateQueryVector, insertContractRule } from '@/lib/ai/vector-store';

export interface IngestContractState {
  success?: boolean;
  message?: string;
  chunksProcessed?: number;
  error?: string;
}

export async function ingestContractAction(
  vendorName: string,
  contractText: string
): Promise<IngestContractState> {
  if (!vendorName.trim() || !contractText.trim()) {
    return { error: 'Vendor name and contract content are required.' };
  }

  try {
    const chunks = chunkContractText(contractText);
    let processedCount = 0;

    for (const chunk of chunks) {
      const ruleCategory = 'General Terms';

      // Use the environment-aware vector generator (Ollama or OpenAI)
      const embedding = await generateQueryVector(chunk);

      await insertContractRule({
        vendorName: vendorName.trim(),
        ruleCategory,
        content: chunk,
        embedding,
      });

      processedCount++;
    }

    return {
      success: true,
      message: `Successfully ingested ${processedCount} rule chunks for ${vendorName}.`,
      chunksProcessed: processedCount,
    };
  } catch (err) {
    console.error('Ingest contract action error:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to process contract.',
    };
  }
}
