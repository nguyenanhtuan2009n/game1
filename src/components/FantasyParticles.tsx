import React from 'react';

/**
 * Bright daytime fantasy particles, radiant sun motes, and golden arcane rings.
 * Provides a luminous, magical anime fantasy sky atmosphere in bright mode.
 */
export const FantasyParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Golden Celestial Arcane Sun-dial Circles in Bright Sky */}
      <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full border-2 border-amber-400/20 border-dashed animate-spin [animation-duration:140s] opacity-70" />
      <div className="absolute -top-20 -right-20 w-[360px] h-[360px] rounded-full border border-sky-400/30 opacity-60" />
      <div className="absolute top-1/3 -left-56 w-[550px] h-[550px] rounded-full border border-amber-300/25 border-dotted animate-spin [animation-duration:200s] opacity-60" />
      <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] rounded-full border border-emerald-400/20 border-dashed animate-spin [animation-duration:160s] opacity-50" />

      {/* Floating Golden Sun Sparks & Radiant Mana Motes */}
      <div 
        className="absolute top-[12%] left-[10%] w-3 h-3 rounded-full bg-amber-400/70 blur-[1px] animate-float-slow shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
        style={{ animationDuration: '7s' }}
      />
      <div 
        className="absolute top-[22%] right-[16%] w-2.5 h-2.5 rounded-full bg-sky-400/60 blur-[1px] animate-float-slow shadow-[0_0_8px_rgba(56,189,248,0.5)]" 
        style={{ animationDuration: '9s', animationDelay: '1s' }}
      />
      <div 
        className="absolute top-[55%] left-[18%] w-2 h-2 rounded-full bg-purple-400/60 blur-[1px] animate-float-slow shadow-[0_0_6px_rgba(168,85,247,0.5)]" 
        style={{ animationDuration: '8s', animationDelay: '2.5s' }}
      />
      <div 
        className="absolute top-[78%] right-[22%] w-3 h-3 rounded-full bg-emerald-400/60 blur-[1px] animate-float-slow shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
        style={{ animationDuration: '11s', animationDelay: '0.5s' }}
      />
      <div 
        className="absolute top-[38%] right-[8%] w-2 h-2 rounded-full bg-amber-300/80 blur-[1px] animate-float-slow shadow-[0_0_6px_rgba(252,211,77,0.6)]" 
        style={{ animationDuration: '6.5s', animationDelay: '3s' }}
      />
      <div 
        className="absolute top-[68%] left-[40%] w-2.5 h-2.5 rounded-full bg-yellow-400/70 blur-[1px] animate-float-slow shadow-[0_0_8px_rgba(250,204,21,0.6)]" 
        style={{ animationDuration: '10s', animationDelay: '1.8s' }}
      />
    </div>
  );
};
