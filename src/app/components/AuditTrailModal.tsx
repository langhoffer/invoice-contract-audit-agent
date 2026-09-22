'use client';

import React, { useEffect, useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';
import { getAuditLogsAction, AuditLogItem } from '@/app/actions/auditLogs';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditTrailModal({ isOpen, onClose }: AuditTrailModalProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const res = await getAuditLogsAction();
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setError(res.error || 'Failed to load audit trail');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Historical Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Review past invoice audits, compliance results, and latency
                metrics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-xs font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />{' '}
              Loading audit history...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No audit history recorded yet. Run a single or batch audit to
              populate logs!
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border bg-slate-950/80 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {log.is_compliant ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Compliant
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Violation Found
                      </span>
                    )}
                    <span className="text-xs font-semibold text-white">
                      {log.invoice_name}
                    </span>
                    {log.vendor_name && (
                      <span className="text-[10px] font-mono text-slate-400">
                        ({log.vendor_name})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    {log.total_amount && (
                      <span>Amount: ${log.total_amount.toLocaleString()}</span>
                    )}
                    {log.latency_ms && (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-400">
                        <Clock className="w-3 h-3" /> {log.latency_ms}ms
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {log.violations && log.violations.length > 0 && (
                  <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg max-w-xs">
                    {log.violations.length} violation(s) flagged
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-500">
            Showing last 50 logs
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
