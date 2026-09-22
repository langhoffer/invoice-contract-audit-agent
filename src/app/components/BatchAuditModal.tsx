'use client';

import { useState } from 'react';
import {
  Layers,
  Upload,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  runBatchAuditAction,
  BatchAuditSummary,
} from '@/app/actions/batch-audit';

interface BatchAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchAuditModal({ isOpen, onClose }: BatchAuditModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [batchSummary, setBatchSummary] = useState<BatchAuditSummary | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunBatch = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setBatchSummary(null);
    setCurrentIndex(0);

    try {
      const formDataList = files.map((file) => {
        const fd = new FormData();
        fd.append('file', file);
        return fd;
      });

      // Simulate streaming progress feedback loop
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));
      }, 1500);

      const response = await runBatchAuditAction(formDataList);
      clearInterval(interval);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Batch audit failed');
      }

      setBatchSummary(response.data);
    } catch (err: any) {
      setError(err.message || 'Error processing batch invoices');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setBatchSummary(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Batch Invoice Processing
              </h2>
              <p className="text-xs text-slate-400">
                Audit multiple PDF invoices simultaneously with real-time
                feedback
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

        {/* Content Area */}
        {!batchSummary ? (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-purple-500/50 bg-slate-950/50 rounded-xl p-6 cursor-pointer transition-all text-center">
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-slate-200">
                Click to select multiple PDF invoices
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Supports batch queuing
              </span>
            </label>

            {files.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Queued Files ({files.length})
                </p>
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-300 font-mono truncate max-w-[400px]">
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunBatch}
                disabled={files.length === 0 || isProcessing}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      Processing [{currentIndex + 1}/{files.length}]...
                    </span>
                  </>
                ) : (
                  <span>Run Batch Audit ({files.length})</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Batch Results Summary */
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Total Processed
                </span>
                <p className="text-xl font-bold text-white mt-1">
                  {batchSummary.totalProcessed}
                </p>
              </div>
              <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/30 text-center">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">
                  Compliant
                </span>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {batchSummary.compliantCount}
                </p>
              </div>
              <div className="bg-rose-950/20 rounded-xl p-4 border border-rose-500/30 text-center">
                <span className="text-[10px] font-mono text-rose-400 uppercase">
                  Violations
                </span>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  {batchSummary.violationCount}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Audit Results breakdown
              </p>
              {batchSummary.results.map((res, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="text-slate-200 font-mono truncate max-w-[300px]">
                    {res.fileName}
                  </span>
                  {res.success && res.data ? (
                    res.data.isCompliant ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <XCircle className="w-4 h-4" />{' '}
                        {res.data.violations?.length || 1} Violation(s)
                      </span>
                    )
                  ) : (
                    <span className="text-rose-400">Failed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Audit Another Batch
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
