'use client';

import { useEffect, useState } from 'react';
import {
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getContractRulesAction,
  toggleRuleStatusAction,
  deleteRuleAction,
  ContractRuleItem,
} from '@/app/actions/rules';

interface DynamicRuleManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DynamicRuleManager({
  isOpen,
  onClose,
}: DynamicRuleManagerProps) {
  const [rules, setRules] = useState<ContractRuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    const res = await getContractRulesAction();
    if (res.success && res.data) {
      setRules(res.data);
    } else {
      setError(res.error || 'Failed to load rules');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: newStatus } : r))
    );

    const res = await toggleRuleStatusAction(id, newStatus);
    if (!res.success) {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: currentStatus } : r))
      );
      setError(res.error || 'Failed to toggle rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this rule from the vector store?'
      )
    )
      return;

    setRules((prev) => prev.filter((r) => r.id !== id));
    const res = await deleteRuleAction(id);
    if (!res.success) {
      setError(res.error || 'Failed to delete rule');
      fetchRules();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Dynamic Rule Manager
              </h2>
              <p className="text-xs text-slate-400">
                Manage vector contract rules stored in Supabase
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
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />{' '}
              Loading contract rules...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No active contract rules found in database. Ingest a contract
              first!
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  (rule.is_active ?? true)
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : 'bg-slate-950/30 border-slate-900/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {rule.rule_category || 'General'}
                    </span>
                    {rule.vendor_name && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {rule.vendor_name}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(rule.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-sans leading-relaxed">
                    {rule.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(rule.id, rule.is_active ?? true)
                    }
                    title={
                      (rule.is_active ?? true) ? 'Disable rule' : 'Enable rule'
                    }
                    className={`p-1.5 rounded-lg transition-colors ${
                      (rule.is_active ?? true)
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {(rule.is_active ?? true) ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rule.id)}
                    title="Delete rule"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-500">
            Total Rules: {rules.length}
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
