import { Download } from 'lucide-react';
import { AuditResult } from '@/app/page';

interface ExportAuditButtonProps {
  auditResult: AuditResult;
}

export function ExportAuditButton({ auditResult }: ExportAuditButtonProps) {
  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(auditResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `audit-report-${auditResult.vendorName.replace(/\s+/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      <span>Export Report</span>
    </button>
  );
}
