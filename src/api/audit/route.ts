import { NextResponse } from 'next/server';
import { parsePdfBuffer } from '@/lib/pdf/parser';
import { auditInvoice } from '@/lib/ai/audit-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let invoiceText = formData.get('invoiceText') as string | null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      invoiceText = await parsePdfBuffer(buffer);
    }

    if (!invoiceText) {
      return NextResponse.json(
        { error: 'No invoice PDF file or text provided' },
        { status: 400 }
      );
    }

    const auditResult = await auditInvoice(invoiceText);
    return NextResponse.json(auditResult);
  } catch (error) {
    console.error('API Audit Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to complete audit' },
      { status: 500 }
    );
  }
}
