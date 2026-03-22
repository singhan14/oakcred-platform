import { useEffect, useState } from 'react';

export default function ScoringMockup() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full aspect-video glass-panel rounded-2xl border border-border/50 p-6 shadow-2xl overflow-hidden transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded shadow-inner bg-surface2 flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg">description</span>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Deep Scan Output</h4>
            <p className="text-xs text-text-muted">GSTIN: 29AABC...</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-success/20 text-success text-[10px] font-bold uppercase rounded-full border border-success/30 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          99.8% Confidence
        </div>
      </div>

      {/* Code / JSON representation of ML Output */}
      <div className="bg-[#0f0f11] rounded-xl p-4 border border-white/5 font-mono text-[11px] text-text-muted h-32 overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f11] pointer-events-none z-10"></div>
        <div className={`transition-transform duration-[3000ms] ease-out ${mounted ? '-translate-y-4' : 'translate-y-4'}`}>
          <p><span className="text-primary">"model_layer"</span>: <span className="text-white">"L2_Ensemble"</span>,</p>
          <p><span className="text-primary">"features_analyzed"</span>: <span className="text-white">4192</span>,</p>
          <p><span className="text-primary">"cross_validation"</span>: &#123;</p>
          <p className="ml-4"><span className="text-primary">"gst_to_bank_variance"</span>: <span className="text-success">"0.02%"</span>,</p>
          <p className="ml-4"><span className="text-primary">"suspicious_patterns"</span>: <span className="text-success">false</span></p>
          <p>&#125;,</p>
          <p><span className="text-primary">"predicted_npa_prob"</span>: <span className="text-success">0.012</span></p>
        </div>
      </div>

    </div>
  );
}
