import { BarChart3, Clock, Database, Cpu, FileCheck } from 'lucide-react';
import { AuditMetrics } from '@/app/page';

interface MetricsVisualizerProps {
  metrics: AuditMetrics;
}

export function MetricsVisualizer({ metrics }: MetricsVisualizerProps) {
  const total = metrics.totalDurationMs || 1;
  const retrievalPercent = Math.round(
    (metrics.retrievalDurationMs / total) * 100
  );
  const evaluationPercent = Math.round(
    (metrics.evaluationDurationMs / total) * 100
  );

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>Audit Pipeline Latency Breakdown</span>
        </h3>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          {metrics.totalDurationMs} ms Total
        </span>
      </div>

      {/* Visual Percentage Distribution Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Database className="w-3.5 h-3.5" /> Vector Search (
            {retrievalPercent}%)
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <Cpu className="w-3.5 h-3.5" /> LLM Evaluation ({evaluationPercent}
            %)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${retrievalPercent}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-l-full transition-all duration-500"
            title={`Vector Search: ${metrics.retrievalDurationMs}ms`}
          />
          <div
            style={{ width: `${evaluationPercent}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-r-full transition-all duration-500"
            title={`LLM Eval: ${metrics.evaluationDurationMs}ms`}
          />
        </div>
      </div>

      {/* Detailed Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/60 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Total Duration
          </div>
          <span className="text-base font-mono font-bold text-emerald-400">
            {metrics.totalDurationMs}{' '}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/60 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Database className="w-3 h-3 text-blue-400" /> Retrieval Time
          </div>
          <span className="text-base font-mono font-bold text-blue-400">
            {metrics.retrievalDurationMs}{' '}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/60 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Cpu className="w-3 h-3 text-purple-400" /> Evaluation Time
          </div>
          <span className="text-base font-mono font-bold text-purple-400">
            {metrics.evaluationDurationMs}{' '}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/60 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            <FileCheck className="w-3 h-3 text-amber-400" /> Rules Retrieved
          </div>
          <span className="text-base font-mono font-bold text-amber-400">
            {metrics.contractRulesRetrieved}{' '}
            <span className="text-xs font-normal text-slate-400">rules</span>
          </span>
        </div>
      </div>
    </div>
  );
}
