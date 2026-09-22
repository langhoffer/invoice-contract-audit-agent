'use server';

import { runAuditAction } from './audit';

export interface BatchAuditSummary {
  totalProcessed: number;
  compliantCount: number;
  violationCount: number;
  results: Array<{
    fileName: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
}

export async function runBatchAuditAction(
  formDataList: FormData[]
): Promise<{ success: boolean; data?: BatchAuditSummary; error?: string }> {
  try {
    const results = [];
    let compliantCount = 0;
    let violationCount = 0;

    for (const formData of formDataList) {
      const fileName = (formData.get('file') as File)?.name || 'Demo Invoice';
      const res = await runAuditAction(formData);

      if (res.success && res.data) {
        if (res.data.isCompliant) {
          compliantCount++;
        } else {
          violationCount++;
        }
        results.push({ fileName, success: true, data: res.data });
      } else {
        results.push({
          fileName,
          success: false,
          error: res.error || 'Audit failed',
        });
      }
    }

    return {
      success: true,
      data: {
        totalProcessed: formDataList.length,
        compliantCount,
        violationCount,
        results,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Batch audit execution failed',
    };
  }
}
