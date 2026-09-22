'use client';

import { useState } from 'react';
import { ingestContractAction } from '@/app/actions/ingest-contract';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ContractIngestionModal({ isOpen, onClose }: Props) {
  const [vendorName, setVendorName] = useState('');
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const result = await ingestContractAction(vendorName, contractText);

    setLoading(false);

    if (result.error) {
      setStatusMessage({ type: 'error', text: result.error });
    } else if (result.success) {
      setStatusMessage({
        type: 'success',
        text: result.message || 'Contract successfully indexed!',
      });
      setVendorName('');
      setContractText('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-xl font-semibold text-indigo-400">
            Ingest Contract Rules
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Acme Cloud Corp"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Contract Terms & Clauses
            </label>
            <textarea
              required
              rows={6}
              placeholder="Paste raw contract terms here (e.g., Payment terms shall be Net 30 days. Maximum hourly rate capped at $150/hr...)"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white rounded-lg shadow-md transition-colors"
            >
              {loading ? 'Embedding & Indexing...' : 'Ingest Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
