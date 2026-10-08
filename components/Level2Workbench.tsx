'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Image as ImageIcon,
  Search,
  CheckCircle2,
  XCircle,
  Terminal,
  ExternalLink,
  Copy,
  Sparkles,
  Zap,
  Award,
  AlertTriangle,
  Database,
  ExternalLink as LinkIcon,
} from 'lucide-react';
import { Participant } from '@/lib/db';

interface Level2WorkbenchProps {
  participant: Participant;
  onParticipantUpdated: (updated: Participant) => void;
}

export default function Level2Workbench({
  participant,
  onParticipantUpdated,
}: Level2WorkbenchProps) {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [copiedHash, setCopiedHash] = useState(false);

  const [verifyResult, setVerifyResult] = useState<{
    success?: boolean;
    isImageMime?: boolean;
    contentType?: string | null;
    byteSize?: number;
    sha256Hash?: string;
    masterHash?: string;
    hashMatched?: boolean;
    error?: string | null;
    completedAt?: string | null;
  } | null>(
    participant.level2_completed
      ? {
          success: true,
          hashMatched: true,
          completedAt: participant.level2_completed_at,
        }
      : null
  );

  const masterTargetUrl = 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/MLSC%20LOGO.jpeg';
  const masterTargetHash = 'a74a8604f4f8ef07dcd1d4a10030fda7c1d84724668fac8fd59a753abc91a04c';

  const handleUseMockImage = (mode: 'valid' | 'invalid' = 'valid') => {
    if (mode === 'valid') {
      // Use the master Supabase URL directly or local proxy endpoint
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const mock = `${origin}/api/test-image`;
      setImageUrlInput(mock);
    } else {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const mock = `${origin}/api/test-image?mode=invalid`;
      setImageUrlInput(mock);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setScanning(true);
    setScanSteps([
      'Connecting to participant Azure image URL...',
      'Validating HTTP headers and Content-Type...',
    ]);
    setVerifyResult(null);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Fetching Master Reference Image from Supabase (MLSC LOGO.jpeg)...',
      ]);
    }, 400);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Computing SHA-256 binary hash of uploaded Azure image vs Master Image...',
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
          ? 'SUCCESS: Azure image SHA-256 hash matches Master MLSC LOGO 100%!'
          : `FAILED: ${data.error || 'Image verification failed'}`,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setVerifyResult({
        success: false,
        error: `Network / Server error: ${msg}`,
      });
    } finally {
      setScanning(false);
    }
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(masterTargetHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="level-workbench space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/90 to-cyan-950/80 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <ImageIcon className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Round 02 / Asset</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Publish the reference asset.
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Share the public link to the requested image. Use the supplied reference as your guide.
          </p>
          <p className="mt-5 max-w-3xl border-l-2 border-red-700 pl-4 text-sm leading-6 text-stone-600">
            Your task is to make the supplied reference asset available through a public link. Place the exact requested file in the destination prepared for this round. Confirm that the link opens directly in a browser without requiring a sign-in. Take care not to alter the source asset while moving it between services. Keep the final URL tidy and ready to share. Review the reference one final time before submission. When everything is in place, submit the public image link below.
          </p>

          {/* Verification Status Badge */}
          {participant.level2_completed && (
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
              <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>LEVEL 2 VERIFIED & PASSED!</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Reference Image & Criteria */}
        <div className="lg:col-span-5 space-y-6">

          {/* Master Target Image Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> Master Supabase Reference Image
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                MASTER TARGET
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-html-element-for-img */}
                <img
                  src={masterTargetUrl}
                  alt="MLSC Master Target Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1 text-xs font-mono text-slate-300 flex-1 overflow-hidden">
                <div className="font-bold text-white truncate">MLSC LOGO.jpeg</div>
                <div className="text-[10px] text-slate-400">Size: 57.5 KB</div>
                <a
                  href={masterTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-0.5"
                >
                  <span>View Supabase Master</span>
                  <LinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Master SHA-256 Hash</span>
                <button
                  onClick={copyHashToClipboard}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[11px]"
                >
                  <Copy className="w-3 h-3" />
                  {copiedHash ? 'Copied!' : 'Copy Hash'}
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 font-mono overflow-x-auto truncate">
                {masterTargetHash}
              </pre>
            </div>
          </div>

          {/* Quick Mock Test Helper */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Instant Test Helper
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use our built-in sample Azure image link to test verification immediately!
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleUseMockImage('valid')}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-mono text-indigo-300 transition flex items-center gap-1"
              >
                <span>Use Sample Azure Image URL</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleUseMockImage('invalid')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 transition"
              >
                Use Invalid Image URL
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Image Verification Form & Live Stream */}
        <div className="lg:col-span-7 space-y-6">

          {/* Workbench Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" /> Input Deployed Azure Image Link
            </h3>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="https://your-azure-blob.blob.core.windows.net/container/MLSC LOGO.jpeg"
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
                    <span>Fetching & Hashing Image...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Submit image</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Terminal Log Stream */}
            {scanSteps.length > 0 && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Terminal className="w-3.5 h-3.5" /> IMAGE HASH COMPARISON LOG
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

            {/* Result Breakdown Card */}
            {verifyResult && (
              <div
                className={`p-5 rounded-2xl border ${
                  verifyResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-red-950/40 border-red-500/40'
                } space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {verifyResult.success ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                    )}
                    <div>
                      <h4
                        className={`text-lg font-bold uppercase tracking-wide ${
                          verifyResult.success ? 'text-emerald-300' : 'text-red-300'
                        }`}
                      >
                        {verifyResult.success
                          ? 'LEVEL 2 VERIFICATION PASSED!'
                          : 'VERIFICATION FAILED'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {verifyResult.success
                          ? 'The Azure image binary SHA-256 hash matched the Supabase MLSC LOGO master image 100%!'
                          : 'The provided Azure image did not match the master Supabase image.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Participant Uploaded Image Preview */}
                {imageUrlInput && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-html-element-for-img */}
                      <img
                        src={imageUrlInput}
                        alt="Uploaded Azure Image Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-xs font-mono text-slate-300 flex-1 overflow-hidden">
                      <div className="text-slate-400">Uploaded Azure Image Details:</div>
                      <div>MIME: <span className="text-cyan-300">{verifyResult.contentType || 'image/jpeg'}</span></div>
                      <div>Byte Size: <span className="text-amber-300">{verifyResult.byteSize ? `${verifyResult.byteSize} bytes` : 'N/A'}</span></div>
                      {verifyResult.sha256Hash && (
                        <div className="truncate text-[10px] text-slate-400">
                          SHA-256: <span className="text-indigo-300">{verifyResult.sha256Hash}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Individual Checklist Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                  {/* Check 1 */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Content-Type Check</span>
                      {verifyResult.isImageMime ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          MATCHED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          FAILED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Header: <code className="text-cyan-300">{verifyResult.contentType || 'image/jpeg'}</code>
                    </div>
                  </div>

                  {/* Check 2 */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">SHA-256 Hash Match</span>
                      {verifyResult.hashMatched ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          100% MATCH
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          MISMATCH
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono truncate">
                      Master Target Hash: <code className="text-indigo-300">{masterTargetHash.substring(0, 12)}...</code>
                    </div>
                  </div>
                </div>

                {verifyResult.error && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/60 text-xs font-mono text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{verifyResult.error}</span>
                  </div>
                )}

                {verifyResult.completedAt && (
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    Timestamp Noted:{' '}
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
