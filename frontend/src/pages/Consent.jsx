import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function Consent() {
  usePageTitle('Secure Consent Portal');
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('review'); // review | otp | success
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleAgree = () => {
    setStep('otp');
    toast.success('OTP sent to your registered mobile number');
  };

  const verifyOtp = () => {
    if (otp.join('').length < 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }
    const id = toast.loading('Verifying identity...');
    setTimeout(() => {
      toast.success('Identity verified & Consent granted', { id });
      setStep('success');
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface w-full max-w-md rounded-2xl p-8 text-center border border-border/50 shadow-xl shadow-success/5 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text mb-2">Consent Granted</h1>
          <p className="text-text-muted text-sm mb-8">You have successfully authorized the financial data fetch. The assessing firm has been notified.</p>
          <div className="bg-bg rounded-lg p-4 border border-border/30 text-left mb-6">
            <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-2">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Request ID</span>
              <span className="font-mono text-xs opacity-70">CR-2024-REQ99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Status</span>
              <span className="font-mono text-xs text-success font-bold">ACTIVE (Valid 6 months)</span>
            </div>
          </div>
          <button className="text-text-muted hover:text-text text-sm font-semibold transition-colors">Close Window</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-64 bg-primary/5 -skew-y-3 origin-top-left -z-10" />
      
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/30 bg-surface2/50 flex flex-col items-center">
           <img src="/vite.svg" alt="CreditIQ" className="h-8 mb-3 opacity-80 backdrop-grayscale grayscale" />
           <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">Secure Consent Portal</p>
           <h1 className="font-display text-xl font-bold text-text text-center leading-tight">Authorize Data Access</h1>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
          {step === 'review' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative">
              
              <div className="text-center p-4 bg-bg rounded-xl border border-border/30">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[24px]">account_balance</span>
                </div>
                <h2 className="font-heading font-semibold text-text text-sm">FinEdge Capital Ltd.</h2>
                <p className="text-xs text-text-muted mt-1">is requesting your permission to fetch financial records for processing your MSME Loan application.</p>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-text text-sm mb-3">Requested Data Points</h3>
                <div className="space-y-2">
                  {[
                    { icon: 'receipt_long', title: 'GST Filing History', desc: 'Summary of GSTR returns (24 months)' },
                    { icon: 'account_balance_wallet', title: 'Bank Statements', desc: 'Account aggregates from connected banks' },
                    { icon: 'policy', title: 'Income Tax Returns', desc: 'Verified ITR-4/ITR-3 for last 3 years' },
                  ].map((d, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/30 bg-bg">
                      <span className="material-symbols-outlined text-primary text-[20px] bg-primary/5 p-1.5 rounded-lg">{d.icon}</span>
                      <div>
                        <h4 className="font-semibold text-sm text-text">{d.title}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 bg-warning/5 border border-warning/20 p-4 rounded-xl">
                <span className="material-symbols-outlined text-warning text-[20px]">security</span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  <strong className="text-text font-semibold">Bank-grade Security:</strong> Your data is accessed via RBI-regulated Account Aggregator framework in read-only mode and is protected with end-to-end 256-bit encryption. It won't be shared with unauthorized third parties.
                </p>
              </div>

            </div>
          ) : (
            <div className="space-y-6 text-center py-4 animate-in slide-in-from-right-4 duration-300">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">dialpad</span>
              <h2 className="font-display text-xl font-bold text-text">Verify it's you</h2>
              <p className="text-sm text-text-muted max-w-[260px] mx-auto">Enter the 6-digit verification code sent to your registered mobile number ending in <strong>******8821</strong>.</p>
              
              <div className="flex justify-center gap-2 mt-6">
                {otp.map((digit, index) => (
                  <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const newOtp = [...otp]; newOtp[index] = val; setOtp(newOtp);
                      if (val && index < 5) document.getElementById(`otp-${index + 1}`).focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`).focus();
                    }}
                    className="w-12 h-14 text-center font-mono text-xl font-bold bg-bg border-2 border-border focus:border-primary focus:bg-surface rounded-xl outline-none transition-all placeholder:text-border" placeholder="•" />
                ))}
              </div>

              <div className="pt-6">
                <button onClick={() => toast.success('A new code has been sent.')} className="text-xs font-semibold text-primary hover:underline">Resend Code</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-surface border-t border-border/30">
          {step === 'review' ? (
            <div className="flex gap-3">
              <button onClick={() => toast.error('Consent Denied. Process aborted.')} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text hover:bg-bg transition-colors">Decline</button>
              <button onClick={handleAgree} className="flex-[2] py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">I Agree & Authenticate</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button onClick={verifyOtp} className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">Verify Request</button>
              <button onClick={() => setStep('review')} className="text-xs text-text-muted hover:text-text transition-colors">Cancel</button>
            </div>
          )}
        </div>
      </div>
      
      <p className="absolute bottom-4 text-[10px] text-text-muted flex items-center gap-1 font-mono">
        <span className="material-symbols-outlined text-[12px]">lock</span> Secured by OakCred
      </p>
    </div>
  );
}
