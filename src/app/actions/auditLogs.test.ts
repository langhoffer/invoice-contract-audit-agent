import {
  getAuditLogsAction,
  saveAuditLogAction,
} from '@/app/actions/auditLogs';
import { supabase } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      insert: jest.fn(),
    })),
  },
}));

describe('Audit Log Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuditLogsAction', () => {
    it('successfully fetches audit logs', async () => {
      const mockLogs = [
        {
          id: '1',
          invoice_name: 'INV-001',
          vendor_name: 'Acme',
          total_amount: 1200,
          is_compliant: true,
          latency_ms: 240,
          created_at: '2026-09-22',
        },
      ];

      const mockLimit = jest
        .fn()
        .mockResolvedValue({ data: mockLogs, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogs);
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('falls back to empty array when data is null', async () => {
      const mockLimit = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('returns error when fetch fails with supabase error message', async () => {
      const mockLimit = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Table error' } });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Table error');
    });

    it('falls back to default error message when supabase error has no message', async () => {
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: {} });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch audit logs');
    });

    it('handles unexpected exceptions during fetch', async () => {
      const mockSelect = jest.fn().mockImplementation(() => {
        throw new Error('Network timeout');
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    it('falls back to default error message when exception has no message during fetch', async () => {
      const mockSelect = jest.fn().mockImplementation(() => {
        throw {};
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAuditLogsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch audit logs');
    });
  });

  describe('saveAuditLogAction', () => {
    const sampleLog = {
      invoice_name: 'INV-002',
      vendor_name: 'Globex',
      total_amount: 500,
      is_compliant: false,
      violations: [{ rule: 'Max limit', details: 'Exceeded' }],
      latency_ms: 310,
    };

    it('successfully saves an audit log', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveAuditLogAction(sampleLog);

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockInsert).toHaveBeenCalledWith([sampleLog]);
    });

    it('returns error when insert fails with supabase error message', async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Insert failed' } });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveAuditLogAction(sampleLog);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
    });

    it('falls back to default error message when supabase insert error has no message', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: {} });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveAuditLogAction(sampleLog);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save audit log');
    });

    it('handles unexpected exceptions during save', async () => {
      const mockInsert = jest.fn().mockImplementation(() => {
        throw new Error('Database down');
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveAuditLogAction(sampleLog);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database down');
    });

    it('falls back to default error message when exception has no message during save', async () => {
      const mockInsert = jest.fn().mockImplementation(() => {
        throw {};
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveAuditLogAction(sampleLog);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save audit log');
    });
  });
});
