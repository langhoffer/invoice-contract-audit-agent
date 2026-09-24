'use server';

import { parsePdfBuffer } from '@/lib/pdf/parser';
import { auditInvoice } from '@/lib/ai/audit-engine';
import { saveAuditLogAction } from '@/app/actions/auditLogs';

export async function runAuditAction(formData: FormData) {
  const startTime = Date.now();

  try {
    const file = formData.get('file') as File | null;
    let invoiceText = formData.get('invoiceText') as string | null;
    const invoiceName = file ? file.name : 'Manual Text Input';

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      invoiceText = await parsePdfBuffer(buffer);
    }

    if (!invoiceText) {
      return { success: false, error: 'No invoice PDF file or text provided.' };
    }

    const result = await auditInvoice(invoiceText);
    const latencyMs = Date.now() - startTime;

    // Persist the audit result and latency metrics to database
    try {
      await saveAuditLogAction({
        invoice_name: invoiceName,
        vendor_name: result.vendorName || 'Unknown',
        total_amount: result.totalInvoiceAmount || 0,
        is_compliant: result.isCompliant ?? true,
        violations: result.violations || [],
        latency_ms: latencyMs,
      });
    } catch (logError) {
      console.error('Failed to persist audit log:', logError);
    }

    return {
      success: true,
      data: { ...result, latencyMs },
    };
  } catch (error: any) {
    console.error('Audit Action Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete audit.',
    };
  }
}
