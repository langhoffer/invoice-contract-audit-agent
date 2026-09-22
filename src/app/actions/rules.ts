'use server';

import { supabase } from '@/lib/db';

export interface ContractRuleItem {
  id: string;
  content: string;
  rule_category: string;
  vendor_name: string;
  is_active: boolean;
  created_at: string;
}

export async function getContractRulesAction(): Promise<{
  success: boolean;
  data?: ContractRuleItem[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('contract_rules')
      .select('id, content, rule_category, vendor_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch contract rules',
    };
  }
}

export async function toggleRuleStatusAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contract_rules')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update rule status',
    };
  }
}

export async function deleteRuleAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contract_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete rule' };
  }
}
