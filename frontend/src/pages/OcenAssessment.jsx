import { useState } from 'react';
import { api } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import toast from 'react-hot-toast';

export default function OcenAssessment() {
  usePageTitle('Cash-Flow Assessment');
  
  const [step, setStep] = useState(1); // 1: Connect Data, 2: Analyzing, 3: Results
  const [form, setForm] = useState({
    name: '', mobile: '', gstin: '', pan: '',
    uploads: { bank: null, gst: null }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const startAnalysis = async () => {
    if (!form.name || !form.pan || !form.uploads.bank || !form.uploads.gst) {
      return toast.error('Please enter entity name, PAN, and upload both data files.');
    }
    setStep(2);
    setLoading(true);
    
    try {
      // 1. Create Borrower Database Entry
      const borrower = await api.post('/borrowers', {
        name: form.name.trim(), type: 'MSME', gstin: form.gstin.toUpperCase() || null,
        pan: form.pan.toUpperCase(), industry: 'General', phone: form.mobile || null
      });

      // 2. Upload files to AI Parser incrementally
      const formDataBank = new FormData();
      formDataBank.append('file', form.uploads.bank);
      await api.upload(`/data/${borrower.id}/upload-bank-statement`, formDataBank);

      const formDataGst = new FormData();
      formDataGst.append('file', form.uploads.gst);
      await api.upload(`/data/${borrower.id}/upload-gst`, formDataGst);

      // 3. Run Cash-Flow Specific Assessment
      const assessment = await api.post(`/assessments/${borrower.id}/run`, {
        requestedLoanAmount: 500000,
        requestedTenureMonths: 12,
        loanPurpose: 'Invoice Discounting' // Cash flow bias
      });

      setResult({ borrower, assessment });
      setStep(3);
      toast.success('Cash-Flow Assessment completed successfully!');
    } catch (err) {
      toast.error(err?.error || err?.message || 'Assessment failed due to parsing error.');
      setStep(1);
    } finally {
      setLoading(false);
    }
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
        <div className="space-y-6 animate-fade-in-up">
          {/* Identity Info */}
          <GlassCard className="p-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-border/50 pb-4 mb-4">Entity Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">Borrower Name*</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-bg border border-border/50 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors" placeholder="e.g. Acme Corp" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">PAN Number*</label>
                  <input type="text" value={form.pan} onChange={e => setForm({...form, pan: e.target.value.toUpperCase()})} className="w-full bg-bg border border-border/50 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors" placeholder="ABCDE1234F" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">GSTIN (Optional)</label>
                  <input type="text" value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value.toUpperCase()})} className="w-full bg-bg border border-border/50 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors" placeholder="22AAAAA0000A1Z5" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">Mobile Number</label>
                  <input type="text" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-bg border border-border/50 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-colors" placeholder="+91 9876543210" />
               </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Account Data */}
            <GlassCard className="p-8 space-y-6 relative overflow-hidden group border-dashed hover:border-primary/50 transition-all cursor-pointer" onClick={() => document.getElementById('cf-bank-upload').click()}>
              <input type="file" id="cf-bank-upload" accept=".pdf,.csv" className="hidden" onChange={(e) => {
                if (e.target.files[0]) {
                  setForm({...form, uploads: {...form.uploads, bank: e.target.files[0]}});
                  toast.success(`Attached ${e.target.files[0].name}`);
                }
              }} />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${form.uploads.bank ? 'bg-success/20 border border-success/30' : 'bg-surface2 border border-border/50'}`}>
                  <span className={`material-symbols-outlined text-[28px] ${form.uploads.bank ? 'text-success' : 'text-primary'}`}>account_balance</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Bank Statements</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-0.5">Account Aggregator Format</p>
                </div>
              </div>

              {!form.uploads.bank ? (
                <div className="space-y-4">
                  <p className="text-sm text-text-muted">Upload multi-month bank statements to securely evaluate cash inflows and bouncing risk profiles via AI parsing.</p>
                  <div className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-border/50 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span> Select Bank PDF
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                   <span className="material-symbols-outlined text-success mt-0.5 text-[32px]">check_circle</span>
                   <p className="text-sm font-semibold text-white mt-2 truncate w-full">{form.uploads.bank.name}</p>
                   <p className="text-xs text-text-muted uppercase tracking-widest mt-1 group-hover:text-primary transition-colors">Click to replace</p>
                </div>
              )}
            </GlassCard>

            {/* GST Data */}
            <GlassCard className="p-8 space-y-6 relative overflow-hidden group border-dashed hover:border-primary/50 transition-all cursor-pointer" onClick={() => document.getElementById('cf-gst-upload').click()}>
              <input type="file" id="cf-gst-upload" accept=".pdf" className="hidden" onChange={(e) => {
                if (e.target.files[0]) {
                  setForm({...form, uploads: {...form.uploads, gst: e.target.files[0]}});
                  toast.success(`Attached ${e.target.files[0].name}`);
                }
              }} />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${form.uploads.gst ? 'bg-success/20 border border-success/30' : 'bg-surface2 border border-border/50'}`}>
                  <span className={`material-symbols-outlined text-[28px] ${form.uploads.gst ? 'text-success' : 'text-secondary'}`}>receipt_long</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">GST Network</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-0.5">Automated GSTR-3B AI</p>
                </div>
              </div>

              {!form.uploads.gst ? (
                <div className="space-y-4">
                  <p className="text-sm text-text-muted">Validate real revenue, seasonal cyclicity, and active invoices by uploading GSTR-3B PDFs representing the last financial year.</p>
                  <div className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-border/50 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span> Select GST PDF
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                   <span className="material-symbols-outlined text-success mt-0.5 text-[32px]">check_circle</span>
                   <p className="text-sm font-semibold text-white mt-2 truncate w-full">{form.uploads.gst.name}</p>
                   <p className="text-xs text-text-muted uppercase tracking-widest mt-1 group-hover:text-primary transition-colors">Click to replace</p>
                </div>
              )}
            </GlassCard>

            <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
               <button 
                 onClick={startAnalysis} 
                 disabled={loading || !form.uploads.bank || !form.uploads.gst || !form.pan || !form.name}
                 className="px-8 py-3.5 bg-gradient-primary rounded-xl font-bold uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
               >
                 Evaluate Cash-Flow Risk <span className="material-symbols-outlined">arrow_forward</span>
               </button>
            </div>
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
             <p className="text-sm text-text-muted flex items-center gap-2 animate-pulse"><span className="material-symbols-outlined text-[16px] text-primary">sync</span> Operating Gemini 2.5 Flash Parser...</p>
             <p className="text-sm text-text-muted flex items-center gap-2 opacity-50"><span className="material-symbols-outlined text-[16px]">hourglass_empty</span> Simulating repayment stress scenarios...</p>
           </div>
        </GlassCard>
      )}

      {step === 3 && result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header Result */}
          <GlassCard className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-surface flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${result.assessment.verdict === 'LOAN_READY' ? 'bg-success/10 border-success/20 text-success' : result.assessment.verdict === 'CONDITIONALLY_READY' ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-error/10 border-error/20 text-error'}`}>
                <span className="material-symbols-outlined text-[14px]">{result.assessment.verdict === 'LOAN_READY' ? 'bolt' : 'warning'}</span> 
                {result.assessment.verdict.replace('_', ' ')}
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-2">{result.borrower.name}</h2>
              <p className="text-text-muted">{result.assessment.aiSummary?.split('##')[0] || `Based on cash velocity and GST consistency, this MSME presents ${result.assessment.confidenceLevel?.toLowerCase() || 'medium'} default risk.`}</p>
            </div>
            
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-8 border-surface2"></div>
               <div className={`absolute inset-0 rounded-full border-8 rounded-full ${result.assessment.overallScore >= 75 ? 'border-success' : result.assessment.overallScore >= 50 ? 'border-warning' : 'border-error'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'rotate(135deg)' }}></div>
               <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`font-display text-5xl font-bold shadow-glow ${result.assessment.overallScore >= 75 ? 'text-success' : result.assessment.overallScore >= 50 ? 'text-warning' : 'text-error'}`}>{result.assessment.overallScore || 0}</span>
                 <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-1">Credit Score</span>
               </div>
            </div>
          </GlassCard>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Cash-Flow Health</h4>
              <p className={`font-display text-3xl font-bold mb-1 ${result.assessment.cashFlowScore >= 75 ? 'text-success' : result.assessment.cashFlowScore >= 50 ? 'text-warning' : 'text-error'}`}>{result.assessment.cashFlowScore || 0}/100</p>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] opacity-70">account_balance</span> Based on vector analysis</p>
            </GlassCard>
            
            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">GST Compliance</h4>
              <p className={`font-display text-3xl font-bold mb-1 ${result.assessment.gstScore >= 75 ? 'text-success' : result.assessment.gstScore >= 50 ? 'text-warning' : 'text-error'}`}>{result.assessment.gstScore || 0}/100</p>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] opacity-70">receipt_long</span> Based on filing data</p>
            </GlassCard>

            <GlassCard className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Debt Service Ratio</h4>
              <p className="font-display text-3xl font-bold text-white mb-1">{result.assessment.dscr ? Number(result.assessment.dscr).toFixed(2) + 'x' : 'N/A'}</p>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] opacity-70">payments</span> Assessed capacity</p>
            </GlassCard>
          </div>

          {/* Recommendation */}
          <GlassCard className="p-0 overflow-hidden">
             <div className="bg-surface2 p-6 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/50">
               <div>
                 <h3 className="font-display text-xl font-bold text-white">AI Credit Memorandum</h3>
                 <p className="text-sm text-text-muted mt-1">{result.assessment.aiInsights?.length > 0 ? `${result.assessment.aiInsights.length} actionable insights generated` : 'Detailed qualitative analysis'}</p>
               </div>
               <span className="material-symbols-outlined text-primary text-4xl hidden md:block">psychology</span>
             </div>
             
             {result.assessment.aiInsights && result.assessment.aiInsights.length > 0 && (
               <div className="p-6 border-b border-border/50 divide-y divide-border/20">
                 {result.assessment.aiInsights.map((insight, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex gap-4 pr-4">
                      <span className={`material-symbols-outlined mt-0.5 ${insight.type === 'STRENGTH' ? 'text-success' : insight.type === 'RISK' ? 'text-error' : 'text-warning'}`}>
                        {insight.type === 'STRENGTH' ? 'verified' : insight.type === 'RISK' ? 'warning' : 'info'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                        <p className="text-xs text-text-muted mt-1">{insight.description}</p>
                      </div>
                    </div>
                 ))}
               </div>
             )}

             <div className="p-4 bg-surface flex justify-end gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg border border-border/50 text-sm font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">Start New</button>
             </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
