import { useEffect, useState } from 'react';

export default function MonitoringMockup() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full aspect-video glass-panel rounded-2xl border border-border/50 p-6 shadow-2xl overflow-hidden transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      
      {/* Map/Radar abstract background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] opacity-50 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Live Early Warnings</h4>
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <span className="text-[10px] text-error font-bold tracking-wider">2 ALERTS</span>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {[
          { firm: "Global Exports", signal: "-15% Inflow Variance", type: "error", icon: "trending_down", delay: "delay-100" },
          { firm: "Vertex Solutions", signal: "New EMI detected", type: "warning", icon: "credit_card", delay: "delay-300" },
          { firm: "Nexus Traders", signal: "Consistent Growth", type: "success", icon: "trending_up", delay: "delay-500" },
        ].map((alert, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-surface2/50 backdrop-blur transition-all duration-700 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'} ${alert.delay}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${alert.type}/10 text-${alert.type} border border-${alert.type}/20`}>
              <span className="material-symbols-outlined text-[16px]">{alert.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-bold">{alert.firm}</p>
              <p className="text-text-muted text-[10px]">{alert.signal}</p>
            </div>
            {alert.type !== "success" && (
              <button className="px-3 py-1 bg-surface text-white text-[10px] font-bold rounded hover:bg-surface-hover border border-white/10 transition-colors">
                REVIEW
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
