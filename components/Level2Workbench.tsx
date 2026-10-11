'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Image as ImageIcon,
  Search,
  CheckCircle2,
  XCircle,
  Terminal,
  Zap,
  Award,
  ArrowRight,
  ShieldAlert,
  Download,
  X,
} from 'lucide-react';
import { Participant } from '@/lib/db';

interface Level2WorkbenchProps {
  participant: Participant;
  onParticipantUpdated: (updated: Participant) => void;
  onNavigateToLevel3?: () => void;
}

const IMAGE_OPTIONS = [
  {
    id: 'lrs',
    label: 'Option A',
    name: 'LRS',
    fullName: 'Locally Redundant Storage',
    url: 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/LRS.png',
  },
  {
    id: 'zrs',
    label: 'Option B',
    name: 'ZRS',
    fullName: 'Zone-Redundant Storage',
    url: 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/ZRS.png',
  },
  {
    id: 'grs',
    label: 'Option C',
    name: 'GRS',
    fullName: 'Geo-Redundant Storage',
    url: 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/GRS.png',
  },
  {
    id: 'gzrs',
    label: 'Option D',
    name: 'GZRS',
    fullName: 'Geo-Zone-Redundant Storage',
    url: 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/GZRS.png',
  },
];

export default function Level2Workbench({
  participant,
  onParticipantUpdated,
  onNavigateToLevel3,
}: Level2WorkbenchProps) {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [verifyResult, setVerifyResult] = useState<{
    success?: boolean;
    error?: string | null;
    completedAt?: string | null;
  } | null>(
    participant.level2_completed
      ? {
          success: true,
          completedAt: participant.level2_completed_at,
        }
      : null
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setScanning(true);
    setScanSteps([
      'Connecting to submitted storage endpoint...',
      'Validating Azure storage host and headers...',
    ]);
    setVerifyResult(null);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Validating submitted storage object...',
      ]);
    }, 400);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Running deployment verification checks...',
      ]);
    }, 800);

    try {
      const res = await fetch('/api/verify-level2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: participant.id,
          imageUrl: imageUrlInput.trim(),
        }),
      });

      const data = await res.json();

      setScanSteps(prev => [
        ...prev,
        data.success
          ? 'SUCCESS: Storage verification passed!'
          : 'FAILED: Verification check failed',
      ]);

      setVerifyResult(data);

      if (data.success && data.participant) {
        onParticipantUpdated(data.participant);

        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
        });
      }
    } catch {
      setVerifyResult({
        success: false,
        error: 'Verification failed. Please read the question properly and try again.',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="level-workbench space-y-6">

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxUrl}
              alt="Enlarged option"
              className="w-full h-full object-contain rounded-xl border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/90 to-cyan-950/80 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ShieldAlert className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Round 02 / Cloud Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Storage Redundancy Challenge
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Read the scenario below. Identify the correct Azure Storage redundancy architecture, deploy that image to Azure Blob Storage, and submit the link.
          </p>

          {/* Verification Status Badge */}
          {participant.level2_completed && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
                <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
                <span>LEVEL 2 VERIFIED & PASSED!</span>
              </div>
              {onNavigateToLevel3 && (
                <button
                  onClick={onNavigateToLevel3}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold text-sm transition"
                >
                  <span>Go to Level 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scenario Question Card */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Scenario</span>
        </div>

        <div className="text-sm text-slate-200 leading-relaxed space-y-3">
          <p className="font-semibold text-white text-base">
            Contoso Global Banking — Disaster Recovery & High Availability
          </p>
          <p>
            Contoso Global Banking processes <span className="text-cyan-300 font-semibold">50+ million financial transactions daily</span> through their Azure-hosted core banking platform. After a recent compliance audit, the Chief Risk Officer has issued the following <span className="text-amber-300 font-semibold">non-negotiable storage requirements</span>:
          </p>

          <div className="space-y-2 pl-1">
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-400">1</span>
              <p>
                <span className="font-semibold text-slate-100">Zone-Level Resilience:</span>{' '}
                If an entire availability zone in the primary region suffers an outage (fire, power failure, cooling malfunction), the storage layer must continue serving reads and writes <span className="text-cyan-300">with zero data loss and zero downtime</span>. Data must be <span className="text-cyan-300">synchronously replicated</span> across multiple physically separated availability zones within the primary region.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-400">2</span>
              <p>
                <span className="font-semibold text-slate-100">Regional Disaster Recovery:</span>{' '}
                In the event of a <span className="text-amber-300">complete regional failure</span> (earthquake, flood, widespread infrastructure collapse), all transaction data must be recoverable from a <span className="text-cyan-300">geographically distant secondary Azure region</span>. Asynchronous replication to the paired region is acceptable for this tier.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-400">3</span>
              <p>
                <span className="font-semibold text-slate-100">Maximum Durability:</span>{' '}
                The solution must offer the <span className="text-amber-300">highest available durability tier</span> (at least 16 nines) for stored objects, combining both cross-zone and cross-region protection in a single configuration.
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-indigo-300">YOUR TASK:</span>{' '}
            Examine the four Azure Storage redundancy architecture diagrams below. Identify which one satisfies <span className="font-semibold text-white">ALL THREE</span> requirements simultaneously. Download the correct diagram, deploy it to <code className="text-cyan-300 font-mono font-bold">Azure Blob Storage</code>, and submit the public URL below.
          </div>
        </div>
      </div>

      {/* 4 Image Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {IMAGE_OPTIONS.map(opt => (
          <div
            key={opt.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 space-y-3 transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  {opt.label}
                </span>
                <span className="text-sm font-bold text-white">{opt.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{opt.fullName}</span>
            </div>

            {/* Image preview */}
            <div
              className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden cursor-pointer group-hover:border-indigo-500/30 transition"
              onClick={() => setLightboxUrl(opt.url)}
            >
              <img
                src={opt.url}
                alt={`${opt.name} Architecture Diagram`}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-xs font-mono text-white bg-black/60 px-3 py-1 rounded-full">
                  Click to enlarge
                </span>
              </div>
            </div>

            {/* Download link */}
            <a
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition"
            >
              <Download className="w-3 h-3" />
              <span>Download {opt.name}.png</span>
            </a>
          </div>
        ))}
      </div>

      {/* Submission Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Instructions recap */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              How to Submit
            </h4>
            <ol className="space-y-2 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
              <li>Study the scenario and identify the correct redundancy model</li>
              <li>Download the correct architecture diagram</li>
              <li>Deploy the image to <code className="text-cyan-300 font-mono font-bold">Azure Blob Storage</code></li>
              <li>Make the blob container public (anonymous read access)</li>
              <li>Paste the public blob URL below and submit</li>
            </ol>
            <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800">
              The submitted image must be an exact byte-for-byte copy of the correct option. Do not resize, compress, or re-encode the file.
            </div>
          </div>
        </div>

        {/* Right: Verification form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" /> Submit Your Answer
            </h3>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="https://your-account.blob.core.windows.net/container/image.png"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono transition"
                />
              </div>

              <button
                type="submit"
                disabled={scanning || !imageUrlInput.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-sm text-slate-950 bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 transition transform active:scale-[0.99] shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Answer...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Terminal Log Stream */}
            {scanSteps.length > 0 && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Terminal className="w-3.5 h-3.5" /> VERIFICATION LOG
                  </span>
                  <span>{scanning ? 'SCANNING' : 'COMPLETED'}</span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  {scanSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${
                        step.startsWith('SUCCESS')
                          ? 'text-emerald-400'
                          : step.startsWith('FAILED')
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Result Card */}
            {verifyResult && (
              <div
                className={`p-6 rounded-2xl border ${
                  verifyResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-red-950/40 border-red-500/40'
                } space-y-4`}
              >
                <div className="flex items-start space-x-3.5">
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4
                      className={`text-lg font-bold uppercase tracking-wide ${
                        verifyResult.success ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {verifyResult.success
                        ? 'VERIFICATION PASSED!'
                        : 'VERIFICATION FAILED'}
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {verifyResult.success
                        ? 'Verification passed! Move to the next question by clicking on Level 3 on top.'
                        : 'Verification failed. Please read the question properly and try again.'}
                    </p>
                  </div>
                </div>

                {verifyResult.success && onNavigateToLevel3 && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <button
                      onClick={onNavigateToLevel3}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Level 3</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {verifyResult.completedAt && (
                  <div className="text-right text-[11px] font-mono text-slate-400 pt-1">
                    Completed At:{' '}
                    <span className="text-emerald-300">
                      {new Date(verifyResult.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
