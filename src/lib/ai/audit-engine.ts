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
  }>;
  summary: string;
}

export async function auditInvoice(invoiceText: string): Promise<AuditResult> {
  // 1. Fetch relevant contract rules via vector search
  const matchedRules = await searchContractRules(invoiceText);

  if (!matchedRules.length) {
    return {
      vendorName: 'Unknown',
      isCompliant: true,
      violations: [],
      summary: 'No relevant contract rules found in database to audit against.',
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
3. Return your analysis strictly as a valid JSON object matching this schema:

{
  "vendorName": "string",
  "isCompliant": boolean,
  "violations": [
    {
      "ruleCategory": "string",
      "contractRule": "string",
      "invoiceClaim": "string",
      "discrepancyDescription": "string",
      "financialImpact": "string"
    }
  ],
  "summary": "string"
}

OUTPUT STRICTLY VALID JSON ONLY. DO NOT INCLUDE ANY CONVERSATIONAL PREAMBLE OR TRAILING EXPLANATIONS.
`;

  // 3. Query LLM natively with AI SDK v5
  const model = getLanguageModel();

  const response = await generateText({
    model,
    prompt,
    temperature: 0.1,
  });

  const rawText = response.text.trim();

  // Extract the outermost JSON object using regex to discard conversational headers/footers
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('Raw LLM Response:', rawText);
    throw new Error('LLM did not return a valid JSON structure.');
  }

  try {
    const auditData: AuditResult = JSON.parse(jsonMatch[0]);
    return auditData;
  } catch (err) {
    console.error('Failed to parse extracted JSON block:\n', jsonMatch[0]);
    throw new Error(
      `LLM did not return a valid JSON response: ${(err as Error).message}`
    );
  }
}
