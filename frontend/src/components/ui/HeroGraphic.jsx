import { useEffect, useState } from 'react';

export default function HeroGraphic() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Slight delay to trigger entry animations
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full max-w-4xl mx-auto transform transition-all duration-1000 flex items-center justify-center ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Tilt Container */}
      <div 
        className="relative z-10 w-full hover:scale-[1.02] transition-transform duration-700 ease-out" 
        style={{ transform: 'perspective(1200px) rotateX(4deg) rotateY(-6deg) rotateZ(1deg)' }}
      >
        {/* Main Dashboard Card */}
        <div className="glass-panel rounded-2xl border border-border/50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Mock Browser Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="text-xs font-mono text-text-muted/50 bg-bg/50 px-4 py-1 rounded-full border border-border/30">
              app.oakcred.com/assessment/live
            </div>
            <div className="w-16 h-4 flex gap-1 justify-end">
              <div className="w-1 h-4 bg-primary rounded-sm opacity-20"></div>
              <div className="w-1 h-4 bg-primary rounded-sm opacity-60"></div>
              <div className="w-1 h-4 bg-primary rounded-sm opacity-100"></div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Left Column: Huge Score Focus */}
            <div className="col-span-1 border border-primary/20 rounded-xl p-6 bg-primary/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              <p className="text-xs text-primary font-bold uppercase mb-4 tracking-wider">OakCred Score</p>
              
              {/* Circular SVG Ring */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" className="text-surface border-opacity-50" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    fill="none" 
                    className="text-primary" 
                    strokeLinecap="round"
                    strokeDasharray="351" 
                    strokeDashoffset={mounted ? 351 * 0.08 : 351} 
                    style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s' }} 
                  />
                </svg>
                <div className="text-center relative z-10">
                  <span className="text-5xl font-display font-bold text-white tracking-tighter shadow-glow">92</span>
                </div>
              </div>
              
              <span className="px-4 py-1.5 bg-success/20 border border-success/30 text-success text-xs font-bold rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                Highly Approved
              </span>
            </div>

            {/* Right Column: Deep Data */}
            <div className="col-span-1 sm:col-span-2 space-y-4">
              
              {/* Top Row Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border/30 rounded-xl p-5 bg-bg/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
                  <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">Suggested Limit</p>
                  <p className="text-2xl font-display font-bold text-white mb-3">₹4.5 Cr</p>
                  <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary w-[80%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  </div>
                </div>
                
                <div className="border border-border/30 rounded-xl p-5 bg-bg/50 relative overflow-hidden">
                  <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">Default Probability</p>
                  <p className="text-2xl font-display font-bold text-white mb-3">1.2%</p>
                  <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[12%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Row Factor Analysis */}
              <div className="border border-border/30 rounded-xl p-5 bg-bg/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold uppercase text-text-muted tracking-wider">Algorithmic Factors</p>
                  <span className="material-symbols-outlined text-text-muted text-[16px]">tune</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Cash Flow Velocity", val: "94%", color: "bg-success", delay: "0.8s" },
                    { label: "GST Return Consistency", val: "88%", color: "bg-success", delay: "1.0s" },
                    { label: "Supplier Network Health", val: "76%", color: "bg-primary", delay: "1.2s" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 flex-shrink-0 text-xs text-text-muted font-medium truncate">{item.label}</div>
                      <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden relative">
                        <div 
                          className={`absolute top-0 left-0 h-full ${item.color} rounded-full`} 
                          style={{ 
                            width: mounted ? item.val : '0%', 
                            transition: `width 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${item.delay}` 
                          }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-xs font-mono font-bold text-white">{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Floating Decorative Elements representing "other dashboards/data" */}
        <div className="absolute -z-10 -right-8 -bottom-8 w-64 h-32 glass-panel rounded-xl border border-border/50 opacity-40 blur-[2px]"></div>
        <div className="absolute -z-10 -left-12 top-12 w-48 h-48 glass-panel rounded-full border border-border/50 opacity-20 blur-[4px]"></div>
      </div>
    </div>
  );
}
