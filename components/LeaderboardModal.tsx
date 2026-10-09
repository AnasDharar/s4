'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Award, Clock, Search, RefreshCw, X, Building2, CheckCircle, ShieldAlert } from 'lucide-react';
import { Participant } from '@/lib/db';

interface LeaderboardModalProps {
  onClose: () => void;
  currentUserId?: string;
}

export default function LeaderboardModal({ onClose, currentUserId }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
      setLeaderboard(data.leaderboard || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filtered = leaderboard.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.college_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (regIso: string, compIso?: string | null) => {
    if (!compIso) return 'In Progress...';
    const start = new Date(regIso).getTime();
    const end = new Date(compIso).getTime();
    const diff = Math.max(0, end - start);
    const secs = Math.floor(diff / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                Leaderboard
              </h2>
              <p className="text-xs text-amber-400/80 font-mono">
                Progress and completion order
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

        {/* Search & Refresh Bar */}
        <div className="my-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contestant or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Rankings</span>
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        {/* Leaderboard Table Container */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3 text-center">Progress</th>
                <th className="px-4 py-3 text-right">Finish Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Fetching leaderboard metrics...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                    No registered participants found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isCurrent = item.id === currentUserId;
                  const rank = idx + 1;
                  const latestTimestamp = item.level3_completed_at || item.level2_completed_at || item.level1_completed_at;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/60 transition ${
                        isCurrent ? 'bg-cyan-950/30 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 font-mono">
                        {rank === 1 ? (
                          <span className="inline-flex items-center space-x-1 text-amber-400 font-black text-sm">
                            <Trophy className="w-4 h-4 fill-amber-400" />
                            <span>#1</span>
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center space-x-1 text-slate-300 font-bold text-sm">
                            <Award className="w-4 h-4 text-slate-300" />
                            <span>#2</span>
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center space-x-1 text-amber-600 font-bold text-sm">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span>#3</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </td>

                      {/* Participant Name */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase font-mono">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Reg: {new Date(item.registered_at).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* College Name */}
                      <td className="px-4 py-3 text-slate-300 font-medium">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.college_name}</span>
                        </div>
                      </td>

                      {/* Level Progress */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {item.level1_completed && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[9px]">
                              L1
                            </span>
                          )}
                          {item.level2_completed && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[9px]">
                              L2
                            </span>
                          )}
                          {item.level3_completed && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-[9px]">
                              L3
                            </span>
                          )}
                          {!item.level1_completed && !item.level2_completed && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Completion Time & Timestamp */}
                      <td className="px-4 py-3 text-right font-mono">
                        {latestTimestamp ? (
                          <div>
                            <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(item.registered_at, latestTimestamp)}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(latestTimestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">--:--</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-right text-[11px] font-mono text-slate-500">
          * Winners are sorted by highest levels completed and fastest finish timestamps.
        </div>

      </div>
    </div>
  );
}
