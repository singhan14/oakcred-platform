import { useEffect, useState } from 'react';

export default function OakCredUIMockup() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full aspect-video glass-panel rounded-xl border border-primary/30 p-4 relative overflow-hidden flex flex-col transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-2xl rounded-full"></div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">bolt</span>
          <span className="text-white text-xs font-bold font-mono tracking-wider">OakCred Intelligence API</span>
        </div>
        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">870ms</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        <div className="bg-bg/50 border border-white/5 rounded-lg p-3 relative overflow-hidden">
          <p className="text-[9px] text-text-muted uppercase mb-1">Instant Verdict</p>
          <p className="text-lg font-bold text-success mb-2">LOAN_READY</p>
          <div className="w-full bg-surface2 h-1 rounded flex overflow-hidden">
            <div className="bg-success w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        <div className="bg-bg/50 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] text-text-muted uppercase">Risk Score</p>
            <p className="text-[9px] text-primary font-bold">HIGH CONFIDENCE</p>
          </div>
          <p className="text-2xl font-display font-black text-white">92<span className="text-sm text-text-muted font-normal">/100</span></p>
        </div>
        
        <div className="col-span-2 bg-success/5 border border-success/10 rounded-lg p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success text-xs">check_circle</span>
            <span className="text-[10px] text-success font-mono">1.2M Data Points Cross-Verified</span>
          </div>
          <button className="text-[9px] bg-success/20 text-success px-2 py-1 rounded">VIEW REPORT</button>
        </div>
      </div>
    </div>
  );
}
