'use server';

import { parsePdfBuffer } from '@/lib/pdf/parser';
import { auditInvoice } from '@/lib/ai/audit-engine';

export async function runAuditAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    let invoiceText = formData.get('invoiceText') as string | null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      invoiceText = await parsePdfBuffer(buffer);
    }

    if (!invoiceText) {
      return { success: false, error: 'No invoice PDF file or text provided.' };
    }

    const result = await auditInvoice(invoiceText);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Audit Action Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete audit.',
    };
  }
}
