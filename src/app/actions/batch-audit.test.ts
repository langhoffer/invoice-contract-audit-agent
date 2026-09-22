import * as auditActionModule from '@/app/actions/audit';
import { runBatchAuditAction } from '@/app/actions/batch-audit';

// Mock the single audit action
jest.mock('@/app/actions/audit', () => ({
  runAuditAction: jest.fn(),
}));

describe('runBatchAuditAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully processes a batch of invoices and tallies compliance', async () => {
    const mockRunAuditAction = auditActionModule.runAuditAction as jest.Mock;

    // Mock response 1: Compliant invoice
    mockRunAuditAction.mockResolvedValueOnce({
      success: true,
      data: { isCompliant: true, vendorName: 'Vendor A' },
    });

    // Mock response 2: Non-compliant invoice with violations
    mockRunAuditAction.mockResolvedValueOnce({
      success: true,
      data: {
        isCompliant: false,
        vendorName: 'Vendor B',
        violations: [{ ruleCategory: 'Rate' }],
      },
    });

    const formData1 = new FormData();
    formData1.append(
      'file',
      new File(['invoice 1 content'], 'invoice1.pdf', {
        type: 'application/pdf',
      })
    );

    const formData2 = new FormData();
    formData2.append(
      'file',
      new File(['invoice 2 content'], 'invoice2.pdf', {
        type: 'application/pdf',
      })
    );

    const result = await runBatchAuditAction([formData1, formData2]);

    expect(result.success).toBe(true);
    expect(result.data?.totalProcessed).toBe(2);
    expect(result.data?.compliantCount).toBe(1);
    expect(result.data?.violationCount).toBe(1);
    expect(result.data?.results).toHaveLength(2);
    expect(result.data?.results[0].fileName).toBe('invoice1.pdf');
    expect(result.data?.results[1].fileName).toBe('invoice2.pdf');
  });

  it('handles failures gracefully in batch processing', async () => {
    const mockRunAuditAction = auditActionModule.runAuditAction as jest.Mock;

    mockRunAuditAction.mockResolvedValueOnce({
      success: false,
      error: 'Parsing error',
    });

    const formData = new FormData();
    formData.append(
      'file',
      new File(['bad file'], 'bad.pdf', { type: 'application/pdf' })
    );

    const result = await runBatchAuditAction([formData]);

    expect(result.success).toBe(true);
    expect(result.data?.totalProcessed).toBe(1);
    expect(result.data?.compliantCount).toBe(0);
    expect(result.data?.violationCount).toBe(0);
    expect(result.data?.results[0].success).toBe(false);
    expect(result.data?.results[0].error).toBe('Parsing error');
  });

  it('falls back to default file name and error message when fields are missing', async () => {
    const mockRunAuditAction = auditActionModule.runAuditAction as jest.Mock;

    // Mock response missing success error string
    mockRunAuditAction.mockResolvedValueOnce({
      success: false,
    });

    // FormData without a named file (triggers 'Demo Invoice' and 'Audit failed' fallbacks)
    const emptyFormData = new FormData();

    const result = await runBatchAuditAction([emptyFormData]);

    expect(result.success).toBe(true);
    expect(result.data?.results[0].fileName).toBe('Demo Invoice');
    expect(result.data?.results[0].error).toBe('Audit failed');
  });

  it('catches unexpected exceptions during batch execution', async () => {
    const mockRunAuditAction = auditActionModule.runAuditAction as jest.Mock;

    // Force an unhandled exception
    mockRunAuditAction.mockRejectedValueOnce(new Error('Network failure'));

    const formData = new FormData();
    formData.append(
      'file',
      new File(['test'], 'test.pdf', { type: 'application/pdf' })
    );

    const result = await runBatchAuditAction([formData]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure');
  });

  it('falls back to default error message when error has no message', async () => {
    const mockRunAuditAction = auditActionModule.runAuditAction as jest.Mock;

    // Throw something without a .message property
    mockRunAuditAction.mockRejectedValueOnce({});

    const formData = new FormData();
    formData.append(
      'file',
      new File(['test'], 'test.pdf', { type: 'application/pdf' })
    );

    const result = await runBatchAuditAction([formData]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Batch audit execution failed');
  });
});
