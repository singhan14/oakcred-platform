import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import toast from 'react-hot-toast';

export default function OcenAssessment() {
  usePageTitle('Cash-Flow Assessment');
  
  const [step, setStep] = useState(1); // 1: Connect Data, 2: Analyzing, 3: Results
  const [bankConnected, setBankConnected] = useState(false);
  const [gstConnected, setGstConnected] = useState(false);
  const [gstin, setGstin] = useState('');
  const [mobile, setMobile] = useState('');

  const handleConnectBank = () => {
    if (!mobile) return toast.error('Enter mobile number to pull Account Aggregator data');
    // Simulate API call to Account Aggregator
    toast.success('OTP sent via Account Aggregator!');
    setTimeout(() => {
      setBankConnected(true);
      toast.success('HDFC Current Account connected');
    }, 1500);
  };

  const handleConnectGST = () => {
    if (!gstin) return toast.error('Enter GSTIN to connect GST Network');
    toast.success('Authenticating with GST Network...');
    setTimeout(() => {
      setGstConnected(true);
      toast.success('24 months of GSTR-3B fetched');
    }, 1500);
  };

  const startAnalysis = () => {
    if (!bankConnected || !gstConnected) return toast.error('Please connect all data sources first');
    setStep(2);
    // Simulate real-time ML analysis
    setTimeout(() => setStep(3), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Cash-Flow <GradientText>Assessment Engine</GradientText>
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-2xl">
          Instantly evaluate MSME creditworthiness using high-provenance, alternative data sources like GST filings and Account Aggregator bank statements. Zero collateral required.
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Bank Account Data */}
          <GlassCard className="p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${bankConnected ? 'bg-success/20 border border-success/30' : 'bg-surface2 border border-border/50'}`}>
                <span className={`material-symbols-outlined text-[28px] ${bankConnected ? 'text-success' : 'text-primary'}`}>account_balance</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Bank Statements</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-0.5">Account Aggregator</p>
              </div>
            </div>

            {!bankConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">Pull real-time banking data directly from the MSME's registered bank accounts to analyze cash velocity and bounce behavior.</p>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Borrower Mobile Number" className="w-full bg-bg border border-border/50 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors" />
                <button onClick={handleConnectBank} className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-border/50 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">sync</span> Connect Bank
                </button>
              </div>
            ) : (
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-4">
                 <span className="material-symbols-outlined text-success mt-0.5">check_circle</span>
                 <div>
                   <p className="text-sm font-semibold text-white">Account successfully linked</p>
                   <p className="text-xs text-success/80 mt-1">Fetched 6 months of HDFC Current Account transactions. Avg monthly inflow: ₹8,42,000</p>
                 </div>
              </div>
            )}
          </GlassCard>

          {/* GST Data */}
          <GlassCard className="p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${gstConnected ? 'bg-success/20 border border-success/30' : 'bg-surface2 border border-border/50'}`}>
                <span className={`material-symbols-outlined text-[28px] ${gstConnected ? 'text-success' : 'text-secondary'}`}>receipt_long</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">GST Network</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-0.5">GSTR-3B & E-Way Bills</p>
              </div>
            </div>

            {!gstConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">Validate real revenue, seasonal cyclicity, and active B2B invoices directly from government tax filing portals.</p>
                <input type="text" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" className="w-full bg-bg border border-border/50 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors font-mono" />
                <button onClick={handleConnectGST} className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-border/50 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cloud_sync</span> Connect GSTIN
                </button>
              </div>
            ) : (
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-start gap-4">
                 <span className="material-symbols-outlined text-success mt-0.5">check_circle</span>
                 <div>
                   <p className="text-sm font-semibold text-white">GSTIN successfully linked</p>
                   <p className="text-xs text-success/80 mt-1">Fetched 24 months of GSTR-3B filings. Consistent filing history detected without major delays.</p>
                 </div>
              </div>
            )}
          </GlassCard>

          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
             <button 
               onClick={startAnalysis} 
               disabled={!bankConnected || !gstConnected}
               className="px-8 py-3.5 bg-gradient-primary rounded-xl font-bold uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
             >
               Evaluate Cash-Flow Risk <span className="material-symbols-outlined">arrow_forward</span>
             </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <GlassCard className="p-16 text-center animate-fade-in-up flex flex-col items-center justify-center min-h-[400px]">
           <div className="relative w-32 h-32 mb-8">
             <div className="absolute inset-0 border-4 border-surface2 rounded-full font-mono"></div>
             <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent border-l-transparent animate-spin"></div>
             <div className="absolute inset-4 border-4 border-secondary rounded-full border-b-transparent border-r-transparent animate-spin animation-delay-200"></div>
             <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-4xl text-primary animate-pulse">analytics</span>
           </div>
           <h2 className="font-display text-2xl font-bold text-white mb-2">Analyzing High-Provenance Data...</h2>
           <div className="space-y-2 mt-4 inline-block text-left">
             <p className="text-sm text-text-muted flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-success">check</span> Calculating cash velocity from 1,240 bank txns...</p>
             <p className="text-sm text-text-muted flex items-center gap-2 animate-pulse"><span className="material-symbols-outlined text-[16px] text-primary">sync</span> Cross-referencing GST revenue with banking inflows...</p>
             <p className="text-sm text-text-muted flex items-center gap-2 opacity-50"><span className="material-symbols-outlined text-[16px]">hourglass_empty</span> Simulating repayment stress scenarios...</p>
           </div>
        </GlassCard>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header Result */}
          <GlassCard className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-surface flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Sachet Loan Approved
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-2">Prime Borrower</h2>
              <p className="text-text-muted">Based on cash velocity and GST consistency, this MSME presents low default risk for short-tenor, unsecured invoice discounting.</p>
            </div>
            
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-8 border-surface2"></div>
               <div className="absolute inset-0 rounded-full border-8 border-primary rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'rotate(135deg)' }}></div>
               <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                 <span className="font-display text-5xl font-bold text-white shadow-glow">890</span>
                 <span className="text-[10px] font-bold tracking-widest uppercase text-primary mt-1">Trust Score</span>
               </div>
            </div>
          </GlassCard>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Repayment Capacity</h4>
              <p className="font-display text-3xl font-bold text-white mb-1">₹14.2L <span className="text-sm font-medium text-text-muted">/mo</span></p>
              <p className="text-xs text-success flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">trending_up</span> Consistent free cash flow</p>
            </GlassCard>
            
            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">GST/Bank Variance</h4>
              <p className="font-display text-3xl font-bold text-white mb-1">&lt; 3%</p>
              <p className="text-xs text-success flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Highly accurate reporting</p>
            </GlassCard>

            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Vulnerability Index</h4>
              <p className="font-display text-3xl font-bold text-white mb-1 border-b-2 border-warning inline-block pb-1">Medium</p>
              <p className="text-xs text-warning mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">info</span> 40% revenue from top 3 clients</p>
            </GlassCard>
          </div>

          {/* Recommendation */}
          <GlassCard className="p-0 border-success/30 overflow-hidden">
             <div className="bg-success/10 p-6 flex items-center justify-between border-b border-success/20">
               <div>
                 <h3 className="font-display text-xl font-bold text-white">Recommended Offer</h3>
                 <p className="text-sm text-success font-medium">Auto-approved for instant disbursal based on alternative data</p>
               </div>
               <span className="material-symbols-outlined text-success text-4xl">inventory_2</span>
             </div>
             <div className="p-6 bg-surface/50 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Product</span>
                   <p className="font-medium text-white">Invoice Discounting</p>
                </div>
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Max Amount</span>
                   <p className="font-mono text-lg font-bold text-white">₹5,00,000</p>
                </div>
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Max Tenor</span>
                   <p className="font-medium text-white">90 Days</p>
                </div>
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Interest Rate</span>
                   <p className="font-medium text-white">12% p.a.</p>
                </div>
             </div>
             <div className="p-4 bg-surface flex justify-end gap-3 border-t border-border/50">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-border/50 text-sm font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">Start New</button>
                <button className="px-6 py-2.5 rounded-lg bg-white text-bg text-sm font-bold uppercase tracking-wider hover:bg-bg hover:text-white hover:border-white border border-transparent transition-all">Generate Sanction Letter</button>
             </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
