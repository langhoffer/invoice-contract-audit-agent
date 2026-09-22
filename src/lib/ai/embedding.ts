import { ollama } from 'ollama-ai-provider';

/**
 * Splits raw contract text into manageable chunks (e.g., by double newline or sections)
 */
export function chunkContractText(
  text: string,
  maxChunkLength: number = 500
): string[] {
  // First attempt to split by paragraphs / section breaks
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= maxChunkLength) {
      chunks.push(para);
    } else {
      // Split large paragraphs by sentences or line breaks
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      let currentChunk = '';

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkLength) {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += ' ' + sentence;
        }
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
    }
  }

  return chunks;
}

/**
 * Generates vector embeddings for a given chunk of text using Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = ollama.textEmbeddingModel('nomic-embed-text');

  // Call embedding provider
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}
