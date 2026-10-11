'use client';

import React, { useEffect, useState } from 'react';
import { History, X, CheckCircle, XCircle, Globe, RefreshCw } from 'lucide-react';
import { VerificationLog } from '@/lib/db';

interface LogsModalProps {
  userId: string;
  onClose: () => void;
}

export default function LogsModal({ userId, onClose }: LogsModalProps) {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user?id=${userId}`);
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300">
              <History className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Submission Verification Logs
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                History of participant deployment verification attempts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Refresh button */}
        <div className="my-3 flex justify-end">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Loading verification logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No verification attempts recorded yet for this participant.
            </div>
          ) : (
            logs.map(log => {
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950/80 border-slate-800'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 font-mono text-slate-300">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-white truncate max-w-md">{log.url}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      {log.status === 'SUCCESS' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verification Passed</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Verification Failed</span>
                        </span>
                      )}
                    </div>

                    <div>
                      {log.status === 'SUCCESS' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]">
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>

                  {log.error_message && (
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                      {log.error_message}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
