import { createOpenAI } from '@ai-sdk/openai';

const isLocal =
  process.env.USE_LOCAL_AI?.trim().replace(/['"]/g, '') === 'true';

export function getLanguageModel() {
  if (isLocal) {
    let baseUrl =
      process.env.OLLAMA_BASE_URL?.trim().replace(/['"]/g, '') ||
      'http://127.0.0.1:11434';

    // Clean trailing slashes and redundant /api prefixes
    baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');

    // Target Ollama's OpenAI-compatible endpoint
    const formattedBaseUrl = `${baseUrl}/v1`;

    const localProvider = createOpenAI({
      baseURL: formattedBaseUrl,
      apiKey: 'ollama', // Dummy key required for local Ollama
    });

    return localProvider.chat('llama3.1:latest');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is missing while USE_LOCAL_AI is set to false.'
    );
  }

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai('gpt-4o-mini');
}
