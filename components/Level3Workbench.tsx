'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Server, XCircle } from 'lucide-react';
import { Participant } from '@/lib/db';

interface Level3WorkbenchProps {
  participant: Participant;
  onParticipantUpdated: (participant: Participant) => void;
}

export default function Level3Workbench({ participant, onParticipantUpdated }: Level3WorkbenchProps) {
  const [ip, setIp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string | null; completedAt?: string | null } | null>(participant.level3_completed ? { success: true, completedAt: participant.level3_completed_at } : null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ip.trim()) return;
    setSubmitting(true); setResult(null);
    try {
      const response = await fetch('/api/verify-level3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: participant.id, vmIp: ip.trim() }) });
      const data = await response.json();
      setResult(data);
      if (data.success && data.participant) {
        onParticipantUpdated(data.participant);
        confetti({ particleCount: 150, spread: 75, origin: { y: 0.6 }, colors: ['#11110f', '#c83227', '#e6d8bd'] });
      }
    } catch { setResult({ success: false, error: 'Unable to verify this submission.' }); }
    finally { setSubmitting(false); }
  };

  return <div className="level-workbench space-y-6">
    <section className="relative overflow-hidden border editorial-rule bg-[#f6f4ef] p-6 sm:p-8">
      <div className="absolute right-6 top-6 text-black/10"><Server className="h-28 w-28" /></div>
      <div className="relative max-w-3xl">
        <p className="editorial-kicker">Round 03 / VM deployment</p>
        <h2 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">Ship a live Nginx server.</h2>
        <div className="mt-4 max-w-3xl space-y-4 text-sm leading-6 text-stone-600"><p>A junior member of your team has been assigned their first cloud infrastructure task, and it has quickly become more difficult than expected. They have spent the day moving between networking rules, virtual-machine settings, remote access, and package installation guides without reaching a working result. The project they are supporting cannot wait for another handoff, so they have asked you to step in and show what a clean deployment looks like. This is your chance to turn a confusing setup into a simple, reliable public service.</p><p>Create a virtual machine on Azure, give it a public IP address, and configure it so that it can serve web traffic over HTTP. Install Nginx and leave the standard Nginx welcome page available at the root of the server. Think of the welcome page as the team&apos;s proof that the machine, operating system, firewall rules, and web server are all working together. Before you submit, test the public address from a browser and make sure the welcome page appears without a login, tunnel, or special port. When the deployment is ready for review, paste only the VM&apos;s public IP address below.</p></div>
        {participant.level3_completed && <p className="mt-6 inline-flex items-center gap-2 border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> ROUND 03 COMPLETE</p>}
      </div>
    </section>
    <section className="editorial-panel max-w-3xl p-6 sm:p-8">
      <p className="editorial-kicker">Your submission</p><h3 className="mt-3 text-xl font-bold">Public VM IP address</h3>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4 sm:flex-row"><input className="editorial-input flex-1" value={ip} onChange={(event) => setIp(event.target.value)} placeholder="203.0.113.10" aria-label="Public VM IP address" /><button className="editorial-button justify-center" type="submit" disabled={submitting || !ip.trim()}>{submitting ? 'Checking…' : 'Verify deployment'}</button></form>
      <p className="mt-4 text-xs text-stone-500">Use a public IP address only. The welcome page must be available at HTTP port 80.</p>
      {result && <div className={`mt-6 flex items-start gap-3 border p-4 text-sm ${result.success ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-red-700 bg-red-50 text-red-900'}`}>{result.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}<div><strong>{result.success ? 'Deployment verified.' : 'Verification unsuccessful.'}</strong><p className="mt-1">{result.success ? 'Your VM is live and this round is complete.' : result.error || 'Review your deployment and try again.'}</p>{result.completedAt && <p className="mt-2 text-xs">Recorded {new Date(result.completedAt).toLocaleString()}.</p>}</div></div>}
    </section>
  </div>;
}
