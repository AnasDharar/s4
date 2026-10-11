'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import RegisterModal from '@/components/RegisterModal';
import LevelSelector from '@/components/LevelSelector';
import Level1Workbench from '@/components/Level1Workbench';
import Level2Workbench from '@/components/Level2Workbench';
import Level3Workbench from '@/components/Level3Workbench';
import { Participant } from '@/lib/db';

export default function Home() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<number>(1);

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
              level3Passed={participant.level3_completed}
            />

            {/* Level 1 View */}
            {activeLevel === 1 && (
              <Level1Workbench
                participant={participant}
                onParticipantUpdated={handleParticipantUpdated}
                onNavigateToLevel2={() => setActiveLevel(2)}
              />
            )}

            {/* Level 2 View */}
            {activeLevel === 2 && (
              <Level2Workbench
                participant={participant}
                onParticipantUpdated={handleParticipantUpdated}
                onNavigateToLevel3={() => setActiveLevel(3)}
              />
            )}

            {activeLevel === 3 && (
              <Level3Workbench
                participant={participant}
                onParticipantUpdated={handleParticipantUpdated}
              />
            )}
          </>
        ) : (
          /* Registration Modal if not logged in */
          <RegisterModal onRegisterSuccess={handleRegisterSuccess} />
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs font-mono text-slate-500">
        CYBERQUEST CTF SYSTEM v1.0 • AUTOMATED WEB PARSER & TIMESTAMP ENGINE
      </footer>

    </div>
  );
}
