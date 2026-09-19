import { createOpenAI } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
debugger;
// Trim whitespace or quotes to ensure strict boolean check
const isLocal =
  process.env.USE_LOCAL_AI?.trim().replace(/['"]/g, "") === "true";

// Initialize Ollama provider
const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api",
});

// Initialize OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Returns the configured LLM model based on environment
 */
export function getLanguageModel() {
  if (isLocal) {
    // Make sure you ran: ollama pull llama3.1
    return ollama("llama3.1");
  }
  return openai("gpt-4o-mini");
}

/**
 * Returns the configured Embedding model based on environment
 */
export function getEmbeddingModel() {
  if (isLocal) {
    // Make sure you ran: ollama pull nomic-embed-text
    return ollama.embedding("nomic-embed-text");
  }
  return openai.embedding("text-embedding-3-small");
}
