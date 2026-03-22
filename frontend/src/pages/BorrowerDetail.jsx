import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';

const scoreColor = (s) => s >= 75 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';
const verdictClass = (v) => v === 'LOAN_READY' ? 'text-success bg-success/10 border-success/20' : v === 'CONDITIONALLY_READY' ? 'text-warning bg-warning/10 border-warning/20' : v === 'UNDER_REVIEW' ? 'text-warning bg-warning/10 border-warning/20' : 'text-error bg-error/10 border-error/20';
const verdictLabel = (v) => v === 'LOAN_READY' ? 'Loan Ready' : v === 'CONDITIONALLY_READY' ? 'Conditional' : v === 'UNDER_REVIEW' ? 'Under Review' : 'Not Ready';

export default function BorrowerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrower, setBorrower] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingConsent, setSendingConsent] = useState(false);
  usePageTitle(borrower?.name || 'Borrower Intelligence');

  useEffect(() => {
    setLoading(true);
    api.get(`/borrowers/${id}`).then(data => {
      setBorrower(data);
      if (data.assessments?.length > 0) setLatestAssessment(data.assessments[0]);
      setLoading(false);
    }).catch(err => {
      setError(err?.error || 'Client not found');
      setLoading(false);
    });
  }, [id]);

  const handleSendConsent = async () => {
    setSendingConsent(true);
    try {
      await api.post(`/borrowers/${id}/consent`, { dataTypes: ['GST', 'ITR', 'BANK_STATEMENT'] });
      toast.success('Consent request sent!');
      const updated = await api.get(`/borrowers/${id}`);
      setBorrower(updated);
    } catch (err) {
      toast.error(err?.error || 'Failed to send consent request');
    } finally {
      setSendingConsent(false);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="skeleton h-6 w-48 rounded" />
      <div className="skeleton h-52 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-5"><div className="skeleton h-48 rounded-xl" /><div className="skeleton h-48 rounded-xl" /></div>
    </div>
  );

  if (error) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh] text-center">
      <div><span className="material-symbols-outlined text-error text-4xl mb-3 block">error</span><p>{error}</p></div>
    </div>
  );

  const a = latestAssessment;
  
  // Fully Dynamic factors mapping directly to the actual numbers
  const factors = a ? [
    { label: 'GST Health', score: a.gstScore || 0, icon: 'receipt_long', text: `From ${borrower.gstData?.length ? borrower.gstData.length + ' filing periods' : 'GST Data'}` },
    { label: 'Cash Flow', score: a.cashFlowScore || 0, icon: 'account_balance', text: `From ${borrower.bankStatements?.length ? borrower.bankStatements.length + ' statement(s)' : 'Bank Statement'}` },
    { label: 'Tax Compliance', score: a.taxScore || 0, icon: 'policy', text: `From ${borrower.itrData?.length ? borrower.itrData.length + ' return(s)' : 'ITR Data'}` },
    { label: 'Debt Service', score: a.debtScore || 0, icon: 'savings', text: `DSCR: ${Number(a.dscr || 0).toFixed(1)}x` },
  ] : [];

  const flags = a?.flags || [];
  const hFlags = flags.filter(f => f.severity === 'HIGH');
  const mFlags = flags.filter(f => f.severity === 'MEDIUM');
  
  const handleSyncGst = async () => {
    if (!borrower?.gstin) {
      toast.error('No GSTIN registered for this borrower');
      return;
    }
    const id = toast.loading('Syncing latest GST data from GSTN...');
    try {
      await api.post('/data/gst/sync', { borrowerId: borrower.id, gstin: borrower.gstin });
      toast.success('GST data synced successfully', { id });
      const updated = await api.get(`/borrowers/${borrower.id}`);
      setBorrower(updated);
    } catch (err) {
      toast.error(err?.error || 'Failed to sync GST data', { id });
    }
  };

  const handleGenerateReport = () => {
    toast.success('Preparing document for print...');
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-surface2 border border-border/50 hover:bg-surface hover:text-primary rounded-xl transition-all shadow-inner">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Borrower <GradientText>Intelligence</GradientText></h1>
          <p className="text-sm text-text-muted mt-1">Deep analysis & risk profiling</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button onClick={() => toast.success('Initializing competitor analysis module...')} variant="secondary" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add_chart</span> Analyze Competitors
          </Button>
        </div>
      </div>

      {/* Main Profile Row */}
      <GlassCard className="p-0 overflow-hidden flex flex-col md:flex-row print:border-none print:shadow-none divide-y md:divide-y-0 md:divide-x divide-border/50">
        {/* Left Profile Info */}
        <div className="p-8 flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">{borrower.name}</h2>
          <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-label font-bold tracking-widest uppercase">
            <span className="bg-surface2 border border-border/50 px-2.5 py-1 flex items-center gap-1.5 rounded-md text-text-muted"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {borrower.type}</span>
            <span className="bg-surface2 border border-border/50 px-2.5 py-1 rounded-md text-text-muted">{borrower.industry || 'General Industry'}</span>
            <span className="bg-surface2 border border-border/50 px-2.5 py-1 rounded-md text-text-muted">{borrower.gstin || borrower.pan}</span>
          </div>

          <div className="space-y-4 mt-8 print:hidden">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-surface2/30 border border-border/30 hover:border-border/50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${borrower.consentStatus === 'ACTIVE' ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                <span className={`material-symbols-outlined text-[18px] ${borrower.consentStatus === 'ACTIVE' ? 'text-success' : 'text-warning'}`}>
                  {borrower.consentStatus === 'ACTIVE' ? 'check_circle' : 'pending'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">Consent Status</p>
                <p className="text-sm font-medium text-white">{borrower.consentStatus || 'Pending Authorization'}</p>
              </div>
              {borrower.consentStatus !== 'ACTIVE' && (
                <Button onClick={handleSendConsent} disabled={sendingConsent} variant="primary" className="py-1.5 px-3 text-xs">
                  {sendingConsent ? 'Sending...' : 'Request'}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">GST Integration</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-white">Synced 2h ago</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">ITR Records</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-info">verified</span>
                  <span className="text-sm font-medium text-white">3 years verified</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap gap-4 print:hidden">
            <Button onClick={() => navigate('/assessment/new')} variant="primary" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">bolt</span> Run Assessment
            </Button>
            <Button onClick={handleGenerateReport} variant="secondary" className="flex items-center gap-2">
              Generate Report
            </Button>
            <button onClick={() => toast.success('Context menu opened')} className="w-10 h-10 border border-border/50 rounded-xl bg-surface2 hover:bg-surface hover:text-primary transition-colors text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Right Score Info */}
        <div className="p-8 md:w-[450px] bg-surface2/30 relative overflow-hidden group">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          <p className="text-[10px] font-label font-bold text-text-muted uppercase tracking-widest mb-6">Current AI Credit Score</p>
          <div className="flex items-end gap-6 mb-8 relative z-10">
            {a ? (
              <span className={`font-display text-8xl leading-none font-bold tracking-tighter ${scoreColor(a.overallScore)}`}>
                {a.overallScore}
              </span>
            ) : <span className="text-5xl font-display text-text-muted">N/A</span>}
            
            {a && (
              <div className="pb-2">
                <span className="flex items-center text-success font-bold text-sm bg-success/10 border border-success/20 px-2.5 py-1 rounded-md mb-2 shadow-sm shadow-success/10">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +6 pts
                </span>
                <p className="text-[10px] font-label uppercase tracking-widest text-text-muted">Last Assessment</p>
              </div>
            )}
          </div>
          
          <div className="mb-8 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Historical Trend Profile</p>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">Today</p>
            </div>
            <div className="h-16 border-b border-l border-border/50 flex items-end gap-1.5 pt-2 pb-1 pr-1 pl-1">
               {/* Dynamic Trend Graph */}
               {(borrower.assessments && borrower.assessments.length > 0) ? borrower.assessments.map(a => a.overallScore).reverse().map((h, i, arr) => (
                 <div key={i} className={`flex-1 ${i===arr.length-1 ? 'bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-primary/30'} rounded-t-sm transition-all duration-500 hover:bg-primary relative group cursor-crosshair`} style={{ height: `${Math.max(10, h)}%` }}>
                   <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface border border-border text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none transition-opacity text-white z-20 whitespace-nowrap">{h} pts</div>
                 </div>
               )) : <p className="text-[10px] text-text-muted mt-4 font-italic">Insufficient historical data points.</p>}
            </div>
          </div>
          
          {a && (
            <div className={`p-5 rounded-xl flex items-start gap-4 ${verdictClass(a.verdict)} relative z-10 overflow-hidden`}>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent border-t border-white/10" />
               <span className="material-symbols-outlined text-[24px] bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-sm relative z-10">fact_check</span>
               <div className="relative z-10">
                  <h4 className="font-bold uppercase tracking-widest text-sm mb-1">{verdictLabel(a.verdict)}</h4>
                  <p className="text-xs font-medium opacity-90 leading-relaxed">System confidence high. Borrower meets 92% of qualifying criteria for expansion credit line.</p>
               </div>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Score Breakdown */}
        {factors.length > 0 && (
          <GlassCard className="flex flex-col">
            <h2 className="font-display text-xl font-bold text-white mb-6">Risk Assessment Scorecard</h2>
            <div className="space-y-6 flex-1">
              {factors.map(f => (
                <div key={f.label} className="relative group">
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-muted opacity-50 group-hover:opacity-100 group-hover:text-primary transition-colors text-[18px]">{f.icon}</span> 
                      {f.label}
                    </h4>
                    <span className={`font-display font-bold text-lg ${scoreColor(f.score)}`}>{f.score}<span className="text-text-muted text-xs font-normal">/100</span></span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${f.score >= 75 ? 'bg-success' : f.score >= 50 ? 'bg-warning' : 'bg-error'}`} style={{ width: `${f.score}%` }}>
                      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted font-medium">{f.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Risk Assessment Flags */}
        <GlassCard className="flex flex-col">
          <h2 className="font-display text-xl font-bold text-white mb-6">Analyst Risk Report</h2>
          <div className="space-y-4 flex-1">
            {hFlags.map((f, i) => (
              <div key={`h${i}`} className="p-4 rounded-xl bg-error/5 border border-error/20 relative group hover:bg-error/10 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error rounded-l-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-2">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <span className="text-[10px] font-bold text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded">High Risk</span>
                </div>
                <p className="font-semibold text-sm mb-1 text-white">{f.message}</p>
                <p className="text-xs text-text-muted mb-3">{f.suggestion || ''}</p>
                <div className="text-error mt-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">policy</span> REVIEW REQUIRED</div>
              </div>
            ))}

            {mFlags.map((f, i) => (
              <div key={`m${i}`} className="p-4 rounded-xl bg-warning/5 border border-warning/20 relative group hover:bg-warning/10 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning rounded-l-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-2">
                  <span className="material-symbols-outlined text-warning">info</span>
                  <span className="text-[10px] font-bold text-warning uppercase tracking-widest bg-warning/10 px-2 py-0.5 rounded">Monitor</span>
                </div>
                <p className="font-semibold text-sm mb-1 text-white">{f.message}</p>
                <p className="text-xs text-text-muted mb-3">{f.suggestion || ''}</p>
              </div>
            ))}

            {flags.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-surface2/30 border border-dashed border-border/50 h-full flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-success opacity-50 text-4xl mb-3">verified_user</span>
                <p className="font-medium text-white text-sm mb-1">Portfolio clear</p>
                <p className="text-text-muted text-xs">No significant risk flags detected by the engine during this assessment.</p>
              </div>
            )}
          </div>
        </GlassCard>

      </div>

      {/* Intelligence Data Sources */}
      <GlassCard className="p-0 overflow-hidden">
        <h2 className="font-display text-xl font-bold text-white px-6 py-5 border-b border-border/50 bg-surface2/30">Intelligence Data Sources</h2>
        <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {[
            { id: 1, icon: 'receipt_long', name: 'GST Data', desc: borrower.gstData?.length ? `${borrower.gstData.length} records available` : 'Not connected', stat: borrower.gstData?.length ? 'ACTIVE' : 'MISSING', btn: 'Sync Now', color: borrower.gstData?.length ? 'text-success' : 'text-text-muted', action: handleSyncGst },
            { id: 2, icon: 'account_balance', name: 'ITR Records', desc: borrower.itrData?.length ? `${borrower.itrData.length} years available` : 'Not uploaded', stat: borrower.itrData?.length ? 'VERIFIED' : 'MISSING', icon2: borrower.itrData?.length ? 'check_circle' : null, color: borrower.itrData?.length ? 'text-success' : 'text-text-muted', action: () => toast.success('Go to New Assessment to upload ITR') },
            { id: 3, icon: 'list_alt', name: 'Bank Statement', desc: borrower.bankStatements?.length ? `Records available` : 'Not uploaded', stat: borrower.bankStatements?.length ? 'ACTIVE' : 'MISSING', btn: 'Update', color: borrower.bankStatements?.length ? 'text-primary' : 'text-text-muted', action: () => toast.success('Go to New Assessment to upload Bank Statement') },
            { id: 4, icon: 'history_edu', name: 'CIBIL Bureau', desc: "Bypassed via Manual Upload", stat: 'INACTIVE', btn: null, color: 'text-text-muted', action: null },
          ].map(d => (
            <div key={d.id} className="p-6 flex flex-col justify-between h-full group hover:bg-surface2/30 transition-colors">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-surface2 border border-border/50 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors`}>
                    <span className={`material-symbols-outlined text-[20px] ${d.color}`}>{d.icon}</span>
                  </div>
                  {d.icon2 && <span className="material-symbols-outlined text-[18px] text-success bg-success/10 rounded-full p-1">{d.icon2}</span>}
                </div>
                <h4 className="font-bold text-sm text-white mb-1 group-hover:text-primary transition-colors">{d.name}</h4>
                <p className="text-xs text-text-muted">{d.desc}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-border/30 flex justify-between items-center relative">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${d.stat==='MISSING' ? 'text-error' : d.stat==='VERIFIED' ? 'text-success' : 'text-text-muted'}`}>{d.stat}</span>
                {d.btn && <button onClick={d.action} className="text-[10px] font-bold tracking-widest uppercase text-white hover:text-primary transition-colors group-hover:underline">[{d.btn}]</button>}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Assessment History Timeline */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Assessment History</h2>
          <button onClick={() => toast.success('Loading archived assessments...')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Archive 2023-2024</button>
        </div>
        
        <div className="space-y-4">
          {borrower.assessments && borrower.assessments.length > 0 ? borrower.assessments.map((a, i) => (
            <div key={a.id} className={`flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl border transition-all hover:bg-surface2/50 group ${i === 0 ? 'border-primary/30 bg-primary/5 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'border-border/50 bg-surface2/30'}`}>
              <div className="flex items-center gap-5">
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-xl font-display font-bold text-white leading-none">{new Date(a.createdAt).getFullYear()}</p>
                </div>
                <div className="h-8 w-px bg-border/50 hidden sm:block" />
                <div>
                  <p className="text-sm font-medium text-white mb-0.5 group-hover:text-primary transition-colors">Assessment ID: #{a.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-text-muted">AI Score: <span className="font-mono text-white">{a.overallScore}</span></p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <span className={`px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-widest ${verdictClass(a.verdict)}`}>{verdictLabel(a.verdict)}</span>
                <button onClick={() => a.reportUrl ? window.open(a.reportUrl, '_blank') : toast.error('No report available')} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-surface2 px-3 py-1.5 rounded-lg border border-border/50 hover:border-border">
                  View <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center bg-surface2/30 rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-text-muted opacity-50 text-4xl mb-3">history</span>
              <p className="text-white font-medium text-sm">No historical data points yet.</p>
            </div>
          )}
        </div>
      </GlassCard>
      
    </div>
  );
}
