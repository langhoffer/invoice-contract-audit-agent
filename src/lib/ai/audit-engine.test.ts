import { auditInvoice } from '@/lib/ai/audit-engine';
import { generateText } from 'ai';
import { searchContractRules } from '@/lib/ai/vector-store';

jest.mock('ai', () => ({
  generateText: jest.fn(),
}));

jest.mock('@/lib/ai/provider', () => ({
  getLanguageModel: jest.fn().mockReturnValue('mock-model'),
}));

jest.mock('@/lib/ai/vector-store', () => ({
  searchContractRules: jest.fn(),
}));

describe('auditInvoice Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fallback result and metrics when no contract rules are found', async () => {
    (searchContractRules as jest.Mock).mockResolvedValueOnce([]);

    const result = await auditInvoice('Sample invoice text');

    expect(result.vendorName).toBe('Unknown');
    expect(result.isCompliant).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metrics).toBeDefined();
    expect(result.metrics?.contractRulesRetrieved).toBe(0);
    expect(result.metrics?.evaluationDurationMs).toBe(0);
    expect(typeof result.metrics?.totalDurationMs).toBe('number');
  });

  it('parses LLM JSON response and attaches timing metrics', async () => {
    // Mock vector store rules
    (searchContractRules as jest.Mock).mockResolvedValueOnce([
      {
        vendor_name: 'Acme Corp',
        rule_category: 'Billing Limit',
        content: 'Rate capped at $150/hr',
      },
    ]);

    // Mock LLM output matching updated JSON structure
    const mockLlmOutput = JSON.stringify({
      vendorName: 'Acme Corp',
      isCompliant: false,
      violations: [
        {
          ruleCategory: 'Billing Limit',
          contractRule: 'Rate capped at $150/hr',
          invoiceClaim: 'Billed at $200/hr',
          discrepancyDescription: 'Overcharged by $50/hr',
          financialImpact: '$500',
          confidenceScore: 95,
        },
      ],
      summary: 'Rate violation detected.',
    });

    (generateText as jest.Mock).mockResolvedValueOnce({
      text: mockLlmOutput,
    });

    const result = await auditInvoice('Acme invoice content');

    expect(result.vendorName).toBe('Acme Corp');
    expect(result.isCompliant).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].confidenceScore).toBe(95);
    expect(result.metrics).toEqual({
      totalDurationMs: expect.any(Number),
      retrievalDurationMs: expect.any(Number),
      evaluationDurationMs: expect.any(Number),
      contractRulesRetrieved: 1,
    });
  });

  it('throws an error if the LLM output does not contain valid JSON', async () => {
    (searchContractRules as jest.Mock).mockResolvedValueOnce([
      {
        vendor_name: 'Acme Corp',
        rule_category: 'Billing Limit',
        content: 'Rate capped at $150/hr',
      },
    ]);

    // Mock malformed conversational text from LLM
    (generateText as jest.Mock).mockResolvedValueOnce({
      text: 'I cannot parse this invoice properly.',
    });

    await expect(auditInvoice('Invalid input')).rejects.toThrow(
      'LLM did not return a valid JSON structure.'
    );
  });

  it('throws an error when JSON extraction succeeds but JSON.parse fails', async () => {
    // Silence console.error for this expected failure test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (searchContractRules as jest.Mock).mockResolvedValueOnce([
      {
        vendor_name: 'Acme Corp',
        rule_category: 'Billing Limit',
        content: 'Rate capped at $150/hr',
      },
    ]);

    // Has braces to pass regex, but invalid JSON syntax inside
    (generateText as unknown as jest.Mock).mockResolvedValueOnce({
      text: '{ "vendorName": "Acme Corp", "invalid_json": unquoted_value }',
    });

    await expect(auditInvoice('Sample invoice content')).rejects.toThrow(
      /LLM did not return a valid JSON response:/
    );

    spy.mockRestore();
  });
});
