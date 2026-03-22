import { useEffect, useState } from 'react';

export default function LegacyUIMockup() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full aspect-video bg-[#110e0e] rounded-xl border border-red-500/20 p-4 relative overflow-hidden flex flex-col transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Old school tab layout */}
      <div className="flex gap-2 border-b border-red-500/10 pb-2 mb-4">
        <div className="px-3 py-1 bg-red-500/10 text-red-500/50 text-[10px] uppercase font-mono rounded">Application_v2.xls</div>
        <div className="px-3 py-1 bg-transparent text-text-muted/30 text-[10px] uppercase font-mono rounded">BankStatements.pdf</div>
      </div>

      {/* Endless loading and errors */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin"></div>
          <div className="w-3/4 h-2 bg-red-500/10 rounded"></div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          <span className="material-symbols-outlined text-red-500/50 text-sm">error</span>
          <div className="w-1/2 h-2 bg-red-500/20 rounded"></div>
        </div>
        
        <div className="mt-6 p-3 bg-red-500/5 border border-red-500/20 rounded border-dashed text-center">
          <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-widest leading-loose">
            Manual Review Required<br/>
            ETA: 3-5 Business Days
          </p>
        </div>
      </div>
      
      {/* Overlay watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <span className="text-red-500 text-6xl font-display font-black transform -rotate-12 border-4 border-red-500 p-2 uppercase tracking-widest inline-block">Manual</span>
      </div>
    </div>
  );
}
