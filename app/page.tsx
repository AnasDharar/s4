'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import RegisterModal from '@/components/RegisterModal';
import LevelSelector from '@/components/LevelSelector';
import Level1Workbench from '@/components/Level1Workbench';
import Level2Workbench from '@/components/Level2Workbench';
import LeaderboardModal from '@/components/LeaderboardModal';
import LogsModal from '@/components/LogsModal';
import { Participant } from '@/lib/db';
import { Lock } from 'lucide-react';

export default function Home() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // Load participant session from localStorage if present
  useEffect(() => {
    const savedId = localStorage.getItem('ctf_participant_id');
    if (!savedId) {
      setLoading(false);
      return;
    }

    fetch(`/api/user?id=${savedId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.participant) {
          setParticipant(data.participant);
          // If Level 1 is passed, auto-select Level 2 if Level 1 was passed
          if (data.participant.level1_completed && !data.participant.level2_completed) {
            setActiveLevel(2);
          }
        } else {
          localStorage.removeItem('ctf_participant_id');
        }
      })
      .catch(() => {
        // ignore load error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRegisterSuccess = (newParticipant: Participant) => {
    localStorage.setItem('ctf_participant_id', newParticipant.id);
    setParticipant(newParticipant);
  };

  const handleLogout = () => {
    localStorage.removeItem('ctf_participant_id');
    setParticipant(null);
  };

  const handleParticipantUpdated = (updated: Participant) => {
    setParticipant(updated);
  };

  if (loading) {
    return (
      <div className="editorial-page flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="editorial-number">01</div>
          <span className="editorial-kicker mt-5 block">Preparing your workspace</span>
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-page flex flex-col selection:bg-red-200">

      {/* Main Navbar */}
      <Navbar
        participant={participant}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenLogs={() => setShowLogs(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="editorial-shell flex-1 py-8 sm:py-12">

        {/* If participant is registered */}
        {participant ? (
          <>
            {/* Level Selector Tabs */}
            <LevelSelector
              activeLevel={activeLevel}
              setActiveLevel={setActiveLevel}
              level1Passed={participant.level1_completed}
              level2Passed={participant.level2_completed}
            />

            {/* Level 1 View */}
            {activeLevel === 1 && (
              <Level1Workbench
                participant={participant}
                onParticipantUpdated={handleParticipantUpdated}
              />
            )}

            {/* Level 2 View */}
            {activeLevel === 2 && (
              <Level2Workbench
                participant={participant}
                onParticipantUpdated={handleParticipantUpdated}
              />
            )}

            {/* Level 3 View (Locked/Teaser) */}
            {activeLevel === 3 && (
              <div className="p-12 text-center bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 max-w-xl mx-auto my-12">
                <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                  Level 3: Core Binary Breach
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Final CTF challenge tier. Unlocks after completing Level 2.
                </p>
                <button
                  onClick={() => setActiveLevel(2)}
                  className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-mono text-indigo-300"
                >
                  ← Return to Level 2 Workbench
                </button>
              </div>
            )}
          </>
        ) : (
          /* Registration Modal if not logged in */
          <RegisterModal onRegisterSuccess={handleRegisterSuccess} />
        )}

      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          currentUserId={participant?.id}
        />
      )}

      {/* Verification Logs Modal */}
      {showLogs && participant && (
        <LogsModal
          userId={participant.id}
          onClose={() => setShowLogs(false)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs font-mono text-slate-500">
        CYBERQUEST CTF SYSTEM v1.0 • AUTOMATED WEB PARSER & TIMESTAMP ENGINE
      </footer>

    </div>
  );
}
