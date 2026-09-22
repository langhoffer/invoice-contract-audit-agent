import {
  getContractRulesAction,
  toggleRuleStatusAction,
  deleteRuleAction,
} from '@/app/actions/rules';
import { supabase } from '@/lib/db';

// Mock Supabase admin client
jest.mock('@/lib/db', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn(),
    })),
  },
}));

describe('Dynamic Rule Manager Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContractRulesAction', () => {
    it('successfully fetches rules from contract_rules table', async () => {
      const mockRules = [
        {
          id: '1',
          content: 'Max rate $150/hr',
          rule_category: 'Rates',
          vendor_name: 'Acme',
          is_active: true,
          created_at: '2026-09-22',
        },
      ];

      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: mockRules, error: null });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getContractRulesAction();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRules);
      expect(supabase.from).toHaveBeenCalledWith('contract_rules');
    });

    it('returns error message when fetch fails', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getContractRulesAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection error');
    });

    it('handles unexpected exceptions during fetch', async () => {
      const mockSelect = jest.fn().mockImplementation(() => {
        throw new Error('Network failure');
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getContractRulesAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
    });

    it('falls back to default error message when exception has no message during fetch', async () => {
      const mockSelect = jest.fn().mockImplementation(() => {
        throw {}; // No .message property
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getContractRulesAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch contract rules');
    });
  });

  describe('toggleRuleStatusAction', () => {
    it('successfully updates rule active status', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await toggleRuleStatusAction('rule-123', false);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
      expect(mockEq).toHaveBeenCalledWith('id', 'rule-123');
    });

    it('returns error when status update fails', async () => {
      const mockEq = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Update failed' } });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await toggleRuleStatusAction('rule-123', true);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });

    it('falls back to default error message when exception has no message during update', async () => {
      const mockUpdate = jest.fn().mockImplementation(() => {
        throw {};
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await toggleRuleStatusAction('rule-123', false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update rule status');
    });
  });

  describe('deleteRuleAction', () => {
    it('successfully deletes a rule', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteRuleAction('rule-123');

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('contract_rules');
      expect(mockEq).toHaveBeenCalledWith('id', 'rule-123');
    });

    it('returns error when deletion fails', async () => {
      const mockEq = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Delete failed' } });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteRuleAction('rule-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });

    it('falls back to default error message when exception has no message during delete', async () => {
      const mockDelete = jest.fn().mockImplementation(() => {
        throw {};
      });
      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await deleteRuleAction('rule-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete rule');
    });
  });

  it('falls back to empty array when data is null during fetch', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getContractRulesAction();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('falls back to default error message when supabase error has no message property', async () => {
    const mockOrder = jest.fn().mockResolvedValue({ data: null, error: {} }); // error object with no message
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getContractRulesAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch contract rules');
  });
});
