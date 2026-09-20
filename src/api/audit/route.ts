import { NextResponse } from 'next/server';
import { auditInvoice } from '@/lib/ai/audit-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceText } = body;

    if (!invoiceText || typeof invoiceText !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "invoiceText" field in request body.' },
        { status: 400 }
      );
    }

    const auditResult = await auditInvoice(invoiceText);
    return NextResponse.json(auditResult);
  } catch (error: any) {
    console.error('Audit route failure:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error during audit pipeline.',
      },
      { status: 500 }
    );
  }
}
