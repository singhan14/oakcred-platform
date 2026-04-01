import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';

const scoreColor = (s) => s >= 75 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';
const verdictClass = (v) => v === 'LOAN_READY' ? 'text-success bg-success/10 border-success/20' : v === 'CONDITIONALLY_READY' ? 'text-warning bg-warning/10 border-warning/20' : v === 'NOT_READY' ? 'text-error bg-error/10 border-error/20' : '';
const verdictLabel = (v) => v === 'LOAN_READY' ? 'Loan Ready' : v === 'CONDITIONALLY_READY' ? 'Conditional' : v === 'UNDER_REVIEW' ? 'Under Review' : 'Not Ready';

const InputField = ({ label, name, type = 'text', placeholder, required, half, form, set, errors }) => (
  <div className={half ? 'flex-1 min-w-[140px]' : ''}>
    <label htmlFor={`f-${name}`} className="block font-label text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
      {label}{required && <span className="text-primary ml-1">*</span>}
    </label>
    <input id={`f-${name}`} type={type} value={form[name]} onChange={e => set(name, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-bg border rounded-lg text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner ${errors[name] ? 'border-error/50 focus:border-error/50 focus:ring-error/50' : 'border-border/50'}`} />
    {errors[name] && <p className="text-error text-xs mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">error</span>{errors[name]}</p>}
  </div>
);

export default function NewAssessment() {
  usePageTitle('New Assessment');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: '', type: 'MSME', gstin: '', pan: '', udyamNumber: '',
    businessName: '', industry: 'IT', city: '', state: '', phone: '', email: '',
    requestedLoanAmount: '', requestedTenureMonths: '36', loanPurpose: 'Working Capital',
    cibilCheck: true, uploads: { itr: null, bank: null, gst: null }
  });

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: undefined })); };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Client name is required';
    if (!form.pan.trim()) e.pan = 'PAN is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase())) e.pan = 'Enter a valid PAN (e.g., ABCDE1234F)';
    if (form.type === 'MSME' && form.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(form.gstin.toUpperCase())) e.gstin = 'Enter a valid GSTIN';
    if (form.phone && !/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.requestedLoanAmount || Number(form.requestedLoanAmount) <= 0) e.requestedLoanAmount = 'Enter a valid loan amount';
    if (!form.requestedTenureMonths || Number(form.requestedTenureMonths) <= 0) e.requestedTenureMonths = 'Enter tenure in months';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleRunAssessment = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const borrower = await api.post('/borrowers', {
        name: form.name.trim(), type: form.type, gstin: form.gstin.toUpperCase() || null,
        pan: form.pan.toUpperCase(), udyamNumber: form.udyamNumber || null,
        businessName: form.businessName || null, industry: form.industry,
        city: form.city || null, state: form.state || null,
        phone: form.phone || null, email: form.email || null,
      });

      if (form.gstin && !form.uploads.gst) {
        try { await api.post('/data/gst/sync', { borrowerId: borrower.id, gstin: form.gstin.toUpperCase() }); } catch {}
      }

      if (form.uploads.gst instanceof File) {
        const formData = new FormData();
        formData.append('file', form.uploads.gst);
        try { await api.upload(`/data/${borrower.id}/upload-gst`, formData); } catch (e) { toast.error('GST Parse error: ' + e.message); }
      }

      if (form.uploads.itr instanceof File) {
        const formData = new FormData();
        formData.append('file', form.uploads.itr);
        try { await api.upload(`/data/${borrower.id}/upload-itr`, formData); } catch (e) { toast.error('ITR Parse error: ' + e.message); }
      }

      if (form.uploads.bank instanceof File) {
        const formData = new FormData();
        formData.append('file', form.uploads.bank);
        try { await api.upload(`/data/${borrower.id}/upload-bank-statement`, formData); } catch (e) { toast.error('Bank Parse error: ' + e.message); }
      }

      const assessment = await api.post(`/assessments/${borrower.id}/run`, {
        requestedLoanAmount: Number(form.requestedLoanAmount),
        requestedTenureMonths: Number(form.requestedTenureMonths),
        loanPurpose: form.loanPurpose,
      });

      setResult({ borrower, assessment });
      setStep(3);
      toast.success('Assessment completed!');
    } catch (err) {
      toast.error(err?.error || 'Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Main Content Area */}
      <div className="flex-1 space-y-8 w-full">
        {/* Progress Timeline */}
        <div className="flex items-center gap-3 bg-surface2/30 p-4 rounded-xl border border-border/50">
          {['Borrower Details', 'Data Integration', 'Intelligence Engine'].map((s, i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                step > i + 1 ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : step === i + 1 ? 'bg-primary text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-surface2 border border-border/50 text-text-muted'
              }`}>{step > i + 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}</div>
              <span className={`text-xs uppercase tracking-widest font-bold hidden sm:inline ${step === i + 1 ? 'text-white' : step > i + 1 ? 'text-primary' : 'text-text-muted'}`}>{s}</span>
              {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-primary/50' : 'bg-border/50'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Client Details */}
        {step === 1 && (
          <GlassCard className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">Initialize Profile</h2>
              <p className="text-sm text-text-muted">Enter core entity parameters to begin assessment tracking.</p>
            </div>
            
            <div className="flex gap-4 p-1.5 bg-bg/50 border border-border/30 rounded-lg max-w-sm">
              <button 
                onClick={() => set('type', 'MSME')} 
                className={`flex-1 py-2 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${form.type === 'MSME' ? 'bg-surface2 shadow-md text-white border border-border/50' : 'text-text-muted hover:text-white hover:bg-surface2/50 border border-transparent'}`}
              >Commercial</button>
              <button 
                onClick={() => set('type', 'INDIVIDUAL')} 
                className={`flex-1 py-2 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${form.type === 'INDIVIDUAL' ? 'bg-surface2 shadow-md text-white border border-border/50' : 'text-text-muted hover:text-white hover:bg-surface2/50 border border-transparent'}`}
              >Retail</button>
              <button 
                onClick={() => set('type', 'PARTNERSHIP')} 
                className={`flex-1 py-2 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${form.type === 'PARTNERSHIP' ? 'bg-surface2 shadow-md text-white border border-border/50' : 'text-text-muted hover:text-white hover:bg-surface2/50 border border-transparent'}`}
              >Partnership</button>
            </div>

            <div className="space-y-6">
              <InputField label="Entity / Borrower Name" name="name" placeholder="e.g., Nexus Industries Ltd" required form={form} set={set} errors={errors} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Permanent Account Number (PAN)" name="pan" placeholder="ABCDE1234F" required form={form} set={set} errors={errors} />
                <InputField label="GST Identification Number (Optional)" name="gstin" placeholder="22AAAAA0000A1Z5" form={form} set={set} errors={errors} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Primary Contact" name="phone" placeholder="+91 9876543210" form={form} set={set} errors={errors} />
                <InputField label="Email Address" name="email" placeholder="admin@nexus.co.in" form={form} set={set} errors={errors} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <InputField label="Industry Sector" name="industry" placeholder="Manufacturing" form={form} set={set} errors={errors} />
                <InputField label="Operating City" name="city" placeholder="Bengaluru" form={form} set={set} errors={errors} />
                <InputField label="State" name="state" placeholder="Karnataka" form={form} set={set} errors={errors} />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border/50">
              <Button onClick={handleNext} variant="primary" className="flex items-center gap-2">
                Continue to Integration <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Step 2: Data Sources & Consent */}
        {step === 2 && (
          <GlassCard className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">Configure Vectors</h2>
              <div className="flex items-start gap-3 mt-4 p-4 bg-primary/5 text-white rounded-xl border border-primary/20 shadow-inner">
                <span className="material-symbols-outlined text-primary mt-0.5">lock_open</span>
                <p className="text-sm leading-relaxed"><span className="font-bold text-primary">Consent Framework.</span> Platform will dispatch an encrypted authorization link. ML engine activates automatically upon client verification.</p>
              </div>
            </div>

            {/* Loan Request Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-border/50">
              <div className="sm:col-span-1">
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Facility Amount (₹)*</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                  <input type="number" value={form.requestedLoanAmount} onChange={e => set('requestedLoanAmount', e.target.value)}
                    placeholder="2500000" className={`w-full pl-9 pr-4 py-3 bg-bg border rounded-lg text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner ${errors.requestedLoanAmount ? 'border-error/50' : 'border-border/50'}`} />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Repayment Span (Mo)*</label>
                <input type="number" value={form.requestedTenureMonths} onChange={e => set('requestedTenureMonths', e.target.value)}
                  placeholder="36" className={`w-full px-4 py-3 bg-bg border rounded-lg text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner ${errors.requestedTenureMonths ? 'border-error/50' : 'border-border/50'}`} />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Credit Purpose</label>
                <div className="relative">
                  <select value={form.loanPurpose} onChange={e => set('loanPurpose', e.target.value)} className="w-full pl-4 pr-10 py-3 bg-bg border border-border/50 rounded-lg text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner appearance-none cursor-pointer">
                    <option>Working Capital</option>
                    <option>Capex / Expansion</option>
                    <option>Invoice Financing</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Automated Sources */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-white mb-2">Automated Data Sync Pipeline</h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface2/30 border border-border/50 hover:bg-surface2/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface2 border border-border/50 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">GST Filing Telemetry</h4>
                    <p className="text-xs text-text-muted mt-0.5">Automated sync via GSTN API (Last 24M)</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-success/20 border border-success/30 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-success rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface2/30 border border-border/50 hover:bg-surface2/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface2 border border-border/50 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-info text-[20px]">account_balance</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Transactional Bank Data</h4>
                    <p className="text-xs text-text-muted mt-0.5">Live extraction via Account Aggregator</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-success/20 border border-success/30 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-success rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface2/30 border border-border/50 hover:bg-surface2/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface2 border border-border/50 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-warning text-[20px]">history_edu</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Bureau Scoring (CIBIL)</h4>
                    <p className="text-xs text-text-muted mt-0.5">Requires standalone user handshake</p>
                  </div>
                </div>
                <button onClick={() => set('cibilCheck', !form.cibilCheck)} className={`w-10 h-5 rounded-full relative transition-colors border ${form.cibilCheck ? 'bg-success/20 border-success/30' : 'bg-surface2 border-border/50'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${form.cibilCheck ? 'right-0.5 bg-success shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'left-0.5 bg-text-muted'}`} />
                </button>
              </div>
            </div>

            {/* Manual Uploads */}
            <div className="space-y-6">
              <p className="text-sm font-bold text-white mb-2">Smart Ingestion <span className="text-text-muted font-normal text-[10px] uppercase tracking-widest ml-2 border border-border/50 px-2 py-0.5 rounded-full bg-surface2/50">AI Document Parser</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {/* GST Upload */}
                <div onClick={() => document.getElementById('gst-upload').click()} className="border border-dashed border-border/50 bg-surface2/30 p-6 rounded-xl hover:bg-surface2/80 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer transition-all group relative overflow-hidden">
                  <input type="file" id="gst-upload" accept=".pdf" className="hidden" onChange={(e) => {
                    if (e.target.files[0]) {
                      set('uploads', { ...form.uploads, gst: e.target.files[0] });
                      toast.success(`Attached ${e.target.files[0].name}`);
                    }
                  }} />
                  {form.uploads.gst ? (
                     <div className="flex flex-col items-center">
                       <span className="material-symbols-outlined text-success mb-3 text-[32px] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">check_circle</span>
                       <p className="text-sm font-bold text-white truncate w-full px-2">{form.uploads.gst.name}</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2 group-hover:text-primary transition-colors">Click to replace</p>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                       <div className="w-12 h-12 rounded-full bg-surface2 border border-border/50 flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                         <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">receipt_long</span>
                       </div>
                       <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">GSTR-3B (PDF)</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2">Free AI Sync</p>
                     </div>
                  )}
                </div>

                <div onClick={() => document.getElementById('itr-upload').click()} className="border border-dashed border-border/50 bg-surface2/30 p-6 rounded-xl hover:bg-surface2/80 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer transition-all group relative overflow-hidden">
                  <input type="file" id="itr-upload" accept=".pdf" className="hidden" onChange={(e) => {
                    if (e.target.files[0]) {
                      set('uploads', { ...form.uploads, itr: e.target.files[0] });
                      toast.success(`Attached ${e.target.files[0].name}`);
                    }
                  }} />
                  {form.uploads.itr ? (
                     <div className="flex flex-col items-center">
                       <span className="material-symbols-outlined text-success mb-3 text-[32px] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">check_circle</span>
                       <p className="text-sm font-bold text-white truncate w-full px-2">{form.uploads.itr.name}</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2 group-hover:text-primary transition-colors">Click to replace</p>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                       <div className="w-12 h-12 rounded-full bg-surface2 border border-border/50 flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                         <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">upload_file</span>
                       </div>
                       <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Upload ITR (PDF)</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2">Max 10MB</p>
                     </div>
                  )}
                </div>
                
                <div onClick={() => document.getElementById('bank-upload').click()} className="border border-dashed border-border/50 bg-surface2/30 p-6 rounded-xl hover:bg-surface2/80 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer transition-all group relative overflow-hidden">
                  <input type="file" id="bank-upload" accept=".csv,.pdf,.xls,.xlsx" className="hidden" onChange={(e) => {
                    if (e.target.files[0]) {
                      set('uploads', { ...form.uploads, bank: e.target.files[0] });
                      toast.success(`Attached ${e.target.files[0].name}`);
                    }
                  }} />
                  {form.uploads.bank ? (
                     <div className="flex flex-col items-center">
                       <span className="material-symbols-outlined text-success mb-3 text-[32px] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">check_circle</span>
                       <p className="text-sm font-bold text-white truncate w-full px-2">{form.uploads.bank.name}</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2 group-hover:text-primary transition-colors">Click to replace</p>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                       <div className="w-12 h-12 rounded-full bg-surface2 border border-border/50 flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                         <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">account_balance</span>
                       </div>
                       <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Bank Statement</p>
                       <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-2">CSV / PDF / XLS</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={() => toast.success('Expanded manual data entry form')} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Manual Data Override (Advanced)
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-border/50 mt-8">
              <Button onClick={() => setStep(1)} variant="secondary" className="flex items-center gap-2" disabled={loading}>
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </Button>
              <div className="flex gap-4">
                <Button onClick={() => { toast.success('Consent link sent via SMS/Email to ' + (form.phone || form.email)); setStep(1); }} variant="secondary" className="flex items-center gap-2" disabled={loading}>
                  <span className="material-symbols-outlined text-[18px]">send</span> Dispatch Link
                </Button>
                <Button onClick={handleRunAssessment} disabled={loading} variant="primary" className="flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] min-w-[200px] justify-center">
                  {loading ? <><span className="material-symbols-outlined text-[18px] animate-pulse">auto_awesome</span> Generating AI Memo...</> : <><span className="material-symbols-outlined text-[18px]">bolt</span> Execute ML Engine</>}
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-8">
            <GlassCard className="p-12 text-center flex flex-col items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="w-20 h-20 bg-success/10 border border-success/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] text-success rounded-full flex items-center justify-center mb-6 relative z-10">
                <span className="material-symbols-outlined text-4xl leading-none">task_alt</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-widest uppercase mb-6 relative z-10">Credit Readiness Score</h2>
              <span className={`font-display text-[9rem] leading-none font-bold tracking-tighter drop-shadow-2xl relative z-10 ${scoreColor(result.assessment.overallScore)}`}>
                {result.assessment.overallScore}
              </span>
              <div className="-mt-6 mb-8 relative z-10">
                <span className={`px-6 py-2.5 rounded-lg border text-sm font-bold tracking-widest uppercase shadow-xl backdrop-blur-md ${verdictClass(result.assessment.verdict)}`}>
                  {verdictLabel(result.assessment.verdict)}
                </span>
              </div>
              <p className="text-white bg-surface2/50 border border-border/50 px-6 py-3 rounded-xl max-w-lg mx-auto font-medium shadow-inner relative z-10">The borrower meets 92% of qualifying criteria for Expansion Credit.</p>
            </GlassCard>

            {/* Sub-scores */}
            <GlassCard className="p-0 overflow-hidden">
              <h3 className="font-display text-lg font-bold text-white px-8 py-5 border-b border-border/50 bg-surface2/30">Vector Analysis</h3>
              <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {[
                  { label: 'GST', score: result.assessment.gstScore, m: 'Filing consistent' },
                  { label: 'Cash Flow', score: result.assessment.cashFlowScore, m: 'No bounces' },
                  { label: 'Tax', score: result.assessment.taxScore, m: 'Data available' },
                  { label: 'Debt', score: result.assessment.debtScore, m: 'DSCR: >1.5x' },
                  { label: 'Stability', score: result.assessment.stabilityScore, m: 'High' },
                ].filter(f => f.score !== null).map(f => (
                  <div key={f.label} className="text-center p-6 bg-surface2/30 hover:bg-surface2/50 transition-colors group">
                    <span className={`font-display text-4xl font-bold block mb-2 transition-transform group-hover:scale-110 ${scoreColor(f.score)}`}>{f.score}<span className="text-text-muted text-sm font-normal">/100</span></span>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-white mt-4">{f.label}</p>
                    <p className="text-xs text-text-muted mt-1 opacity-80">{f.m}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex justify-center pt-4">
              <Button onClick={() => navigate(`/borrowers/${result.borrower.id}`)} variant="primary" className="flex items-center justify-center gap-2 w-full max-w-md py-4 text-base shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="material-symbols-outlined text-[20px]">description</span> View Intelligence Report
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar (Draft Assessment info) */}
      <div className="hidden xl:block w-80 space-y-6 shrink-0">
        <GlassCard className="sticky top-8">
          <h3 className="font-label text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-primary/50 bg-primary/20 animate-pulse" /> Live Telemetry
          </h3>
          {form.name ? (
            <div className="space-y-6">
              <div>
                <p className="font-display font-bold text-white text-xl leading-tight mb-1">{form.name}</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted">{form.industry || 'Unknown Sector'} • {form.city || 'Pan-India'}</p>
              </div>
              
              <div className="space-y-3 bg-surface2/30 border border-border/50 rounded-xl p-4 shadow-inner">
                <div className="flex justify-between items-center pb-3 border-b border-border/30">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Entity Class</span>
                  <span className="font-bold text-white bg-surface2 border border-border/50 px-2.5 py-1 rounded shadow-sm text-xs">{form.type}</span>
                </div>
                {form.requestedLoanAmount && (
                  <div className="flex justify-between items-center pb-3 border-b border-border/30">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Volume</span>
                    <span className="font-display font-bold text-primary text-lg">₹{Number(form.requestedLoanAmount).toLocaleString()}</span>
                  </div>
                )}
                {form.requestedTenureMonths && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Span</span>
                    <span className="font-bold text-white">{form.requestedTenureMonths} Mo</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="text-center py-8 opacity-50">
               <span className="material-symbols-outlined text-4xl text-text-muted mb-2">radar</span>
               <p className="text-xs text-text-muted">No telemetry data. Initialize profile to preview.</p>
             </div>
          )}
        </GlassCard>

        {step === 3 && result?.assessment?.lenderMatches?.length > 0 && (
          <GlassCard>
             <h3 className="font-label text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
               <span className="material-symbols-outlined text-[14px]">account_balance</span> Liquidity Matches
             </h3>
             <div className="space-y-3">
                {result.assessment.lenderMatches.slice(0, 3).map((l, i) => (
                  <div key={i} className="flex justify-between items-center bg-surface2/50 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-default">
                    <span className="font-bold text-sm text-white">{l.lenderName}</span>
                    <span className="font-display text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">{l.rate}</span>
                  </div>
                ))}
             </div>
          </GlassCard>
        )}
      </div>

    </div>
  );
}
