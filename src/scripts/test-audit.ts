import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { auditInvoice } from '@/lib/ai/audit-engine';

const sampleMismatchedInvoice = `
INVOICE #INV-2026-991
Vendor: Acme Corp
Date: Sept 15, 2026

Line Items:
1. Senior Engineering Consulting - 10 hours @ $200/hr = $2,000
2. Standard Shipping & Freight Fee = $150

Total Due: $2,150
Payment Terms: Net 15 Days
`;

async function test() {
  console.log('📄 Running Invoice Audit Pipeline against local Ollama...\n');

  const auditResult = await auditInvoice(sampleMismatchedInvoice);

  console.log('================ AUDIT REPORT ================');
  console.log(`Vendor Identified: ${auditResult.vendorName}`);
  console.log(`Compliant: ${auditResult.isCompliant ? '✅ YES' : '❌ NO'}`);
  console.log(`Summary: ${auditResult.summary}\n`);

  if (auditResult.violations.length > 0) {
    console.log('🚨 VIOLATIONS DETECTED:');
    console.table(auditResult.violations);
  }
}

test().catch(console.error);
