// src/lib/ai/audit-engine.ts
import { generateText } from 'ai';
import { getLanguageModel } from '@/lib/ai/provider';
import { searchContractRules } from '@/lib/ai/vector-store';

export interface AuditResult {
  vendorName: string;
  isCompliant: boolean;
  totalInvoiceAmount?: number;
  violations: Array<{
    ruleCategory: string;
    contractRule: string;
    invoiceClaim: string;
    discrepancyDescription: string;
    financialImpact: string;
    confidenceScore?: number; // Added confidence score
  }>;
  summary: string;
  metrics?: {
    // Added performance metrics
    totalDurationMs: number;
    retrievalDurationMs: number;
    evaluationDurationMs: number;
    contractRulesRetrieved: number;
  };
}

export async function auditInvoice(invoiceText: string): Promise<AuditResult> {
  const startTime = performance.now();

  // 1. Fetch relevant contract rules via vector search & measure time
  const retrievalStart = performance.now();
  const matchedRules = await searchContractRules(invoiceText);
  const retrievalDurationMs = Math.round(performance.now() - retrievalStart);

  if (!matchedRules.length) {
    const totalDurationMs = Math.round(performance.now() - startTime);
    return {
      vendorName: 'Unknown',
      isCompliant: true,
      violations: [],
      summary: 'No relevant contract rules found in database to audit against.',
      metrics: {
        totalDurationMs,
        retrievalDurationMs,
        evaluationDurationMs: 0,
        contractRulesRetrieved: 0,
      },
    };
  }

  // Format retrieved context rules for the LLM
  const rulesContext = matchedRules
    .map(
      (r, idx) =>
        `Rule ${idx + 1} [Vendor: ${r.vendor_name}, Category: ${r.rule_category}]:\n${r.content}`
    )
    .join('\n\n');

  // 2. Prepare System Prompt for Llama 3.1 / Local Provider
  const prompt = `
You are an expert Enterprise Invoice and Contract Auditor. Your job is to catch overcharges, unauthorized fees, rate breaches, and missed discounts.

CONTRACT RULES RETRIEVED FROM VECTOR STORE:
${rulesContext}

INVOICE TO AUDIT:
"""
${invoiceText}
"""

INSTRUCTIONS:
1. Compare the items, rates, payment terms, and totals in the INVOICE against the CONTRACT RULES.
2. Flag ANY discrepancy, overcharge, unapplied discount, or term violation.
3. For each violation, assign an integer confidenceScore from 0 to 100 based on certainty.
4. Return your analysis strictly as a valid JSON object matching this schema:

{
  "vendorName": "string",
  "isCompliant": boolean,
  "violations": [
    {
      "ruleCategory": "string",
      "contractRule": "string",
      "invoiceClaim": "string",
      "discrepancyDescription": "string",
      "financialImpact": "string",
      "confidenceScore": number
    }
  ],
  "summary": "string"
}

OUTPUT STRICTLY VALID JSON ONLY. DO NOT INCLUDE ANY CONVERSATIONAL PREAMBLE OR TRAILING EXPLANATIONS.
`;

  // 3. Query LLM natively with AI SDK v5 & measure evaluation time
  const evalStart = performance.now();
  const model = getLanguageModel();

  const response = await generateText({
    model,
    prompt,
    temperature: 0.1,
  });
  const evaluationDurationMs = Math.round(performance.now() - evalStart);

  const rawText = response.text.trim();

  // Extract the outermost JSON object using regex to discard conversational headers/footers
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Raw LLM Response:', rawText);
    throw new Error('LLM did not return a valid JSON structure.');
  }

  try {
    const parsedData = JSON.parse(jsonMatch[0]);
    const totalDurationMs = Math.round(performance.now() - startTime);

    const auditData: AuditResult = {
      ...parsedData,
      metrics: {
        totalDurationMs,
        retrievalDurationMs,
        evaluationDurationMs,
        contractRulesRetrieved: matchedRules.length,
      },
    };

    return auditData;
  } catch (err) {
    console.error('Failed to parse extracted JSON block:\n', jsonMatch[0]);
    throw new Error(
      `LLM did not return a valid JSON response: ${(err as Error).message}`
    );
  }
}
