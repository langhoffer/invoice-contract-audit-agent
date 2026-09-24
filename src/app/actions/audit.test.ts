import { runAuditAction } from '@/app/actions/audit';
import { parsePdfBuffer } from '@/lib/pdf/parser';
import { auditInvoice } from '@/lib/ai/audit-engine';
import { saveAuditLogAction } from '@/app/actions/auditLogs';

// Mock external dependencies
jest.mock('@/lib/pdf/parser', () => ({
  parsePdfBuffer: jest.fn(),
}));

jest.mock('@/lib/ai/audit-engine', () => ({
  auditInvoice: jest.fn(),
}));

jest.mock('@/app/actions/auditLogs', () => ({
  saveAuditLogAction: jest.fn().mockResolvedValue({ success: true }),
}));

describe('runAuditAction Server Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully audit a PDF file and save the audit log with all fields', async () => {
    (parsePdfBuffer as jest.Mock).mockResolvedValue(
      'Sample Invoice Text Content'
    );
    (auditInvoice as jest.Mock).mockResolvedValue({
      vendorName: 'Acme Corp',
      isCompliant: true,
      totalInvoiceAmount: 1500.0,
      violations: [],
      summary: 'All checks passed.',
    });

    const formData = new FormData();
    const mockFile = new File(['dummy content'], 'invoice.pdf', {
      type: 'application/pdf',
    });
    // Ensure arrayBuffer is explicitly mocked for the test environment
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
    formData.append('file', mockFile);

    const result = await runAuditAction(formData);

    expect(result.success).toBe(true);
    expect(saveAuditLogAction).toHaveBeenCalledTimes(1);
    expect(saveAuditLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_name: 'invoice.pdf',
        vendor_name: 'Acme Corp',
        total_amount: 1500.0,
        is_compliant: true,
        violations: [],
      })
    );
  });

  it('should fallback to default values when optional audit fields are missing', async () => {
    (parsePdfBuffer as jest.Mock).mockResolvedValue('Sample Text');
    // Return an audit result missing vendorName, totalInvoiceAmount, isCompliant, and violations
    (auditInvoice as jest.Mock).mockResolvedValue({
      summary: 'Incomplete data returned',
    });

    const formData = new FormData();
    const mockFile = new File(['dummy'], 'test.pdf', {
      type: 'application/pdf',
    });
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
    formData.append('file', mockFile);

    const result = await runAuditAction(formData);

    expect(result.success).toBe(true);
    // Verify fallback defaults are correctly passed to saveAuditLogAction
    expect(saveAuditLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        vendor_name: 'Unknown',
        total_amount: 0,
        is_compliant: true,
        violations: [],
      })
    );
  });

  it('should support manual text input instead of file upload', async () => {
    (auditInvoice as jest.Mock).mockResolvedValue({
      vendorName: 'Manual Vendor',
      isCompliant: false,
      totalInvoiceAmount: 500,
      violations: [{ ruleCategory: 'Tax' }],
      summary: 'Violation found',
    });

    const formData = new FormData();
    formData.append('invoiceText', 'Direct invoice string input');

    const result = await runAuditAction(formData);

    expect(result.success).toBe(true);
    expect(saveAuditLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_name: 'Manual Text Input',
        vendor_name: 'Manual Vendor',
      })
    );
  });

  it('should return an error if neither file nor text is provided', async () => {
    const formData = new FormData(); // Empty

    const result = await runAuditAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No invoice PDF file or text provided.');
    expect(saveAuditLogAction).not.toHaveBeenCalled();
  });

  it('should handle execution errors gracefully and return failure response', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (parsePdfBuffer as jest.Mock).mockRejectedValue(
      new Error('PDF parsing crash')
    );

    const formData = new FormData();
    const mockFile = new File(['dummy'], 'bad.pdf', {
      type: 'application/pdf',
    });
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
    formData.append('file', mockFile);

    const result = await runAuditAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('PDF parsing crash');

    consoleSpy.mockRestore();
  });

  it('should fallback to default error message if error has no message', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    // Throw a non-Error string or object that lacks a .message property
    (parsePdfBuffer as jest.Mock).mockRejectedValue('String error crash');

    const formData = new FormData();
    const mockFile = new File(['dummy'], 'bad.pdf', {
      type: 'application/pdf',
    });
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
    formData.append('file', mockFile);

    const result = await runAuditAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to complete audit.');

    consoleSpy.mockRestore();
  });

  it('should catch and log error if database persistence fails without breaking audit return', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (parsePdfBuffer as jest.Mock).mockResolvedValue('Sample Invoice Text');
    (auditInvoice as jest.Mock).mockResolvedValue({
      vendorName: 'Acme Corp',
      isCompliant: true,
      totalInvoiceAmount: 100,
      violations: [],
      summary: 'Passed',
    });

    // Force saveAuditLogAction to fail / throw an error
    (saveAuditLogAction as jest.Mock).mockRejectedValueOnce(
      new Error('Supabase down')
    );

    const formData = new FormData();
    const mockFile = new File(['dummy'], 'invoice.pdf', {
      type: 'application/pdf',
    });
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
    formData.append('file', mockFile);

    const result = await runAuditAction(formData);

    // Even though DB logging failed, the audit should still return success to the user
    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to persist audit log:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
