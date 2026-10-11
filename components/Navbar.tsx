'use client';

import React, { useEffect, useState } from 'react';
import { Clock, LogOut, ShieldCheck, Flag } from 'lucide-react';
import { Participant } from '@/lib/db';

interface NavbarProps {
  participant: Participant | null;
  onLogout: () => void;
}

export default function Navbar({
  participant,
  onLogout,
}: NavbarProps) {
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  useEffect(() => {
    if (!participant?.registered_at) return;

    const interval = setInterval(() => {
      const regTime = new Date(participant.registered_at).getTime();
      
      // If completed level 1, calculate time up to completion or current
      const endTime = participant.level1_completed && participant.level1_completed_at
        ? new Date(participant.level1_completed_at).getTime()
        : Date.now();

      const diffMs = Math.max(0, endTime - regTime);
      const totalSeconds = Math.floor(diffMs / 1000);

      const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

      setElapsed(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [participant]);

  return (
    <header className="sticky top-0 z-40 border-b editorial-rule bg-[#eeece5]/95 backdrop-blur-lg">
      <div className="editorial-shell h-18 flex items-center justify-between py-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="fieldwork-mark flex h-8 w-8 items-center justify-center bg-[#11110f] text-[#f6f4ef]">
            <Flag className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="editorial-display text-2xl flex items-center gap-2">
              Fieldwork <span className="red-mark text-sm">/ 01</span>
            </h1>
            <p className="editorial-kicker hidden sm:block">
              Participant challenge series
            </p>
          </div>
        </div>

        {/* Middle Stats - Timer & Participant Info */}
        {participant && (
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Live Timer */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs sm:text-sm">
              <Clock className={`w-4 h-4 text-cyan-400 ${participant.level1_completed ? '' : 'animate-pulse'}`} />
              <span>
                {participant.level1_completed ? 'Finished: ' : 'Elapsed: '}
                <strong className="text-white font-bold">{elapsed}</strong>
              </span>
            </div>

            {/* User Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">{participant.name}</span>
                <span className="text-slate-500 mx-1">•</span>
                <span className="text-slate-400">{participant.college_name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {participant && (
            <button
              onClick={onLogout}
              title="Switch Participant"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition border border-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
