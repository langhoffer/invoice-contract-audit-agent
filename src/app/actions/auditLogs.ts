'use server';

import { supabase } from '@/lib/db';

export interface AuditLogItem {
  id: string;
  invoice_name: string;
  vendor_name?: string;
  total_amount?: number;
  is_compliant: boolean;
  violations?: any[];
  latency_ms?: number;
  created_at: string;
}

export async function getAuditLogsAction(): Promise<{
  success: boolean;
  data?: AuditLogItem[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch audit logs',
    };
  }
}

export async function saveAuditLogAction(
  log: Omit<AuditLogItem, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('audit_logs').insert([log]);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save audit log' };
  }
}
