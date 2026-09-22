export interface AuditReportData {
  invoiceId?: string;
  vendorName?: string;
  auditTimestamp: string;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'FLAGGED';
  totalDiscrepancyAmount?: number;
  confidenceScore: number;
  metrics: {
    totalDurationMs: number;
    retrievalDurationMs: number;
    evaluationDurationMs: number;
    contractRulesRetrieved: number;
  };
  violations: Array<{
    ruleCategory: string;
    description: string;
    flaggedAmount?: number;
    ruleReference: string;
    confidenceScore: number;
  }>;
}

/**
 * Trigger client-side download of audit data as JSON
 */
export function exportAuditAsJSON(
  data: AuditReportData,
  filename = 'audit-report.json'
) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print window with an enterprise-styled printable HTML report
 */
export function printAuditReportPDF(data: AuditReportData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Audit Compliance Report - ${data.vendorName || 'Invoice Audit'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .status-badge { padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
          .FLAGGED { background-color: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
          .COMPLIANT { background-color: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
          .card-title { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
          .card-value { font-size: 18px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; }
          .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Invoice Audit Compliance Report</div>
            <div style="color: #64748b; font-size: 14px; margin-top: 4px;">Vendor: ${data.vendorName || 'N/A'} | Date: ${new Date(data.auditTimestamp).toLocaleString()}</div>
          </div>
          <div>
            <span class="status-badge ${data.complianceStatus}">${data.complianceStatus}</span>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Overall Confidence Score</div>
            <div class="card-value">${data.confidenceScore}%</div>
          </div>
          <div class="card">
            <div class="card-title">Total Execution Latency</div>
            <div class="card-value">${data.metrics.totalDurationMs} ms</div>
          </div>
        </div>

        <h3 style="color: #0f172a; margin-bottom: 10px;">Detected Rule Violations</h3>
        ${
          data.violations.length === 0
            ? '<p style="color: #16a34a;">No violations detected. Invoice is fully compliant.</p>'
            : `
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Violation Description</th>
                <th>Contract Rule Reference</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              ${data.violations
                .map(
                  (v) => `
                <tr>
                  <td><strong>${v.ruleCategory}</strong></td>
                  <td>${v.description}</td>
                  <td><em>"${v.ruleReference}"</em></td>
                  <td>${v.confidenceScore}%</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
        }

        <div class="footer">
          Generated automatically by Enterprise AI Invoice & Contract Audit Agent
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
