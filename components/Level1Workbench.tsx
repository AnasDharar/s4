'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Terminal,
  ExternalLink,
  Code2,
  Copy,
  Sparkles,
  Zap,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Participant } from '@/lib/db';

interface Level1WorkbenchProps {
  participant: Participant;
  onParticipantUpdated: (updated: Participant) => void;
}

export default function Level1Workbench({
  participant,
  onParticipantUpdated,
}: Level1WorkbenchProps) {
  const [urlInput, setUrlInput] = useState(participant.level1_url || '');
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const [verifyResult, setVerifyResult] = useState<{
    success?: boolean;
    sectionMatched?: boolean;
    h3Matched?: boolean;
    sectionFoundContent?: string | null;
    h3FoundContent?: string | null;
    error?: string | null;
    completedAt?: string | null;
  } | null>(
    participant.level1_completed
      ? {
          success: true,
          sectionMatched: true,
          h3Matched: true,
          completedAt: participant.level1_completed_at,
        }
      : null
  );

  const handleUseMockUrl = (mode: 'valid' | 'invalid' = 'valid') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const mock = `${origin}/api/test-site${mode === 'invalid' ? '?mode=invalid' : ''}`;
    setUrlInput(mock);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setScanning(true);
    setScanSteps([
      'Connecting to target HTTP host...',
      'Receiving DOM stream and scanning HTML structure...',
    ]);
    setVerifyResult(null);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Scanning DOM elements for <section id="hero"> tag anywhere in HTML...',
      ]);
    }, 400);

    setTimeout(() => {
      setScanSteps(prev => [
        ...prev,
        'Scanning DOM elements for <h3 id="enterprise-security"> tag anywhere in HTML...',
      ]);
    }, 800);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: participant.id,
          websiteUrl: urlInput.trim(),
        }),
      });

      const data = await res.json();

      setScanSteps(prev => [
        ...prev,
        data.success
          ? 'SUCCESS: Both <section id="hero"> and <h3 id="enterprise-security"> tags verified!'
          : `FAILED: ${data.error || 'Verification check failed'}`,
      ]);

      setVerifyResult(data);

      if (data.success && data.participant) {
        onParticipantUpdated(data.participant);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setVerifyResult({
        success: false,
        sectionMatched: false,
        h3Matched: false,
        error: `Network / Server error: ${msg}`,
      });
    } finally {
      setScanning(false);
    }
  };

  const sampleHtmlCode = `<section id="hero">
  <h3 id="enterprise-security">Enterprise Security Portal</h3>
</section>`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(sampleHtmlCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="level-workbench space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Terminal className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Round 01 / Website</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            Build the required page.
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Share a public link to your page. It should include the two required elements below.
          </p>
          <div className="mt-5 max-w-3xl border-l-2 border-red-700 pl-4 text-sm leading-6 text-stone-600 space-y-4">
            <p>A fast-growing SaaS startup has reached an important turning point. After months of refining its product, the team is ready to show its website to prospective customers, partners, and early investors. Their engineering team has completed the application, but their release plan has hit a wall just before launch. They need someone who can take ownership of the deployment and turn a repository into a dependable public website. As a competitor brought in at the final hour, you have been asked to make that launch happen.</p>
            <p>The team has shared its working project through their GitHub repository: <a className="font-semibold text-red-700 underline underline-offset-2" href="https://github.com/AnasDharar/demo" target="_blank" rel="noreferrer">github.com/AnasDharar/demo</a>. Study the project, prepare it for production, and deploy it on the Azure platform. Your result should be a publicly accessible website that a real visitor can open without credentials or a local development environment. Treat this as more than a quick upload: the startup is trusting you with its first public impression. Before submitting, visit the deployed page yourself and make sure the site is responding correctly. When the release is ready, paste the public Azure website link below.</p>
          </div>

          {/* Verification Status Badge */}
          {participant.level1_completed && (
            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
              <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>LEVEL 1 VERIFIED & PASSED!</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Rules & Code Snippet, Right Verification Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Requirements & Quick Test */}
        <div className="lg:col-span-5 space-y-6">

          {/* Required Criteria Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" /> Required HTML Elements
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                CRITERIA 2/2
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Requirement 1 */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-semibold">Requirement 1:</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    &lt;section&gt; element
                  </span>
                </div>
                <div className="font-mono text-slate-300">
                  Target ID: <code className="text-amber-400 font-bold">id=&quot;hero&quot;</code>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Location: Can be anywhere in the HTML
                </div>
              </div>

              {/* Requirement 2 */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-semibold">Requirement 2:</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    &lt;h3&gt; element
                  </span>
                </div>
                <div className="font-mono text-slate-300">
                  Target ID: <code className="text-amber-400 font-bold">id=&quot;enterprise-security&quot;</code>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Location: Can be anywhere in the HTML
                </div>
              </div>
            </div>

            {/* Code Copy Snippet */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Sample Valid HTML Code</span>
                <button
                  onClick={copyCodeToClipboard}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSnippet ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto">
                {sampleHtmlCode}
              </pre>
            </div>
          </div>

          {/* Quick Mock Test Helper */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Instant Test Helper
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use our built-in mock endpoint to test verification immediately!
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleUseMockUrl('valid')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition flex items-center gap-1"
              >
                <span>Use Valid Test URL</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleUseMockUrl('invalid')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 transition"
              >
                Use Invalid Test URL
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Verification Workbench Form & Terminal */}
        <div className="lg:col-span-7 space-y-6">

          {/* Workbench Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> Input Target Website URL
            </h3>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  required
                  placeholder="https://your-website-link.com"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono transition"
                />
              </div>

              <button
                type="submit"
                disabled={scanning || !urlInput.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition transform active:scale-[0.99] shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Scanning & Verifying Website...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
              <span>Submit website</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Terminal Log Stream */}
            {scanSteps.length > 0 && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" /> VERIFIER LOG STREAM
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

            {/* Verification Result Breakdown Card */}
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
                          ? 'LEVEL 1 VERIFICATION PASSED!'
                          : 'VERIFICATION FAILED'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {verifyResult.success
                          ? 'Both required HTML elements were successfully found anywhere in the webpage DOM.'
                          : 'One or more required HTML tags were missing.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Checklist Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                  {/* Check 1 */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">&lt;section id=&quot;hero&quot;&gt;</span>
                      {verifyResult.sectionMatched ? (
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
                      Selector: <code className="text-cyan-300">section#hero</code>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Status: {verifyResult.sectionFoundContent || (verifyResult.sectionMatched ? 'Found' : 'Not found')}
                    </div>
                  </div>

                  {/* Check 2 */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">&lt;h3 id=&quot;enterprise-security&quot;&gt;</span>
                      {verifyResult.h3Matched ? (
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
                      Selector: <code className="text-cyan-300">h3#enterprise-security</code>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Status: {verifyResult.h3FoundContent || (verifyResult.h3Matched ? 'Found' : 'Not found')}
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
