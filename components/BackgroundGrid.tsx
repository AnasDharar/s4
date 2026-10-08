'use client';

import React from 'react';

export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-950 to-black" />

      {/* Cyber Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #38bdf8 1px, transparent 1px),
            linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 30%, black 40%, transparent 80%)'
        }}
      />

      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
    </div>
  );
}
