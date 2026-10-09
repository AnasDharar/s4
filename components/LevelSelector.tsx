'use client';

import React from 'react';
import { ShieldCheck, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';

interface LevelSelectorProps {
  activeLevel: number;
  setActiveLevel: (lvl: number) => void;
  level1Passed: boolean;
  level2Passed: boolean;
  level3Passed: boolean;
}

export default function LevelSelector({
  activeLevel,
  setActiveLevel,
  level1Passed,
  level2Passed,
  level3Passed,
}: LevelSelectorProps) {
  const levels = [
    {
      id: 1,
      title: 'Round 01: Website',
      desc: 'Build and submit your required page.',
      status: level1Passed ? 'COMPLETED' : 'ACTIVE',
      locked: false,
    },
    {
      id: 2,
      title: 'Round 02: Asset',
      desc: 'Publish the required reference image.',
      status: level2Passed ? 'COMPLETED' : level1Passed ? 'ACTIVE' : 'LOCKED',
      locked: !level1Passed,
    },
    {
      id: 3,
      title: 'Round 03: VM Deployment',
      desc: 'Deploy Nginx on a public virtual machine.',
      status: level3Passed ? 'COMPLETED' : level2Passed ? 'ACTIVE' : 'LOCKED',
      locked: !level2Passed,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {levels.map(lvl => {
        const isActive = activeLevel === lvl.id;

        return (
          <button
            key={lvl.id}
            onClick={() => !lvl.locked && setActiveLevel(lvl.id)}
            disabled={lvl.locked}
            className={`relative p-4 rounded-2xl border text-left transition transform active:scale-[0.99] ${
              isActive
                ? 'bg-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                : lvl.locked
                ? 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Status indicator */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm border-2 font-semibold font-mono tracking-wider uppercase px-2 py-0.5 rounded text-black">
                ROUND 0{lvl.id}
              </span>

              {lvl.status === 'COMPLETED' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> PASSED
                </span>
              ) : lvl.locked ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  <ShieldCheck className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>

            <h3
              className={`text-sm font-bold truncate ${
                isActive ? 'text-white' : lvl.locked ? 'text-slate-500' : 'text-slate-200'
              }`}
            >
              {lvl.title}
            </h3>

            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {lvl.desc}
            </p>

            {isActive && (
              <div className="mt-3 flex items-center text-xs text-cyan-400 font-mono font-semibold">
                <span>Open brief</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
