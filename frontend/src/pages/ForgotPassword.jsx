import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  usePageTitle('Recover Account');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP + New Password
  const [errors, setErrors] = useState({});
  const { forgotPassword, resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }

    try {
      await forgotPassword(email);
      setStep(2);
      setErrors({});
      toast.success('Recovery code sent to your email!');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to send recovery code.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!otp || otp.length !== 6) newErrors.otp = 'Enter 6-digit code';
    if (!newPassword) newErrors.password = 'New password is required';
    else if (newPassword.length < 6) newErrors.password = 'Must be at least 6 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      toast.success('Password successfully reset!');
      navigate('/login');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to reset password. Code may be expired.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  return (
    <main className="flex min-h-screen bg-bg">
      {/* Left Panel - PREMIUM BRANDING */}
      <section className="hidden md:flex flex-col justify-between w-[50%] bg-surface/30 p-12 relative overflow-hidden border-r border-border/50 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/10 to-transparent opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-xl uppercase">account_tree</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Oak<span className="text-primary">Cred</span></h1>
        </div>
        
        <div className="relative z-10">
          <div className="mb-6 w-16 h-16 rounded-2xl bg-surface2 border border-border/50 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
          </div>
          <h2 className="text-5xl font-display font-light text-white mb-6 leading-tight">Secure <span className="font-bold text-primary">Recovery.</span></h2>
          <p className="text-text-muted text-xl mb-8 max-w-sm leading-relaxed">Regain access to your institutional workspace in seconds with encrypted OTP verification.</p>
        </div>
      </section>

      {/* Right Panel */}
      <section className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-border/50 shadow-2xl backdrop-blur-xl">
          
          {step === 1 ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-tighter">Recover Access</h2>
                <p className="text-text-muted text-sm tracking-wide">Enter your email to receive a reset code</p>
              </div>
              
              <form onSubmit={handleSendCode} className="space-y-6" noValidate>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Account Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">mail</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="hello@oakcred.com" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono" />
                  </div>
                  {errors.email && <p className="text-error text-xs font-medium mt-1">{errors.email}</p>}
                </div>

                {errors.form && <div className="p-3 bg-error/10 border border-error/50 rounded-xl text-error text-xs text-center font-medium">{errors.form}</div>}

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-white font-bold py-3.5 rounded-xl hover-glow transition-all uppercase tracking-widest disabled:opacity-50 mt-4">
                  {isLoading ? 'Verifying...' : 'Send Recovery Code'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">key</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-tighter">Enter Code</h2>
              <p className="text-sm text-text-muted leading-relaxed mb-6 tracking-wide">
                A 6-digit reset code was sent to <br/> <span className="text-white font-mono">{email}</span>
              </p>
              
              <form onSubmit={handleResetPassword} className="space-y-6 text-left">
                <div className="space-y-2">
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" className="w-full text-center py-4 bg-bg border border-border/50 rounded-xl text-white text-3xl font-mono tracking-[0.5em] outline-none focus:border-primary transition-all placeholder:text-text-muted/20" />
                  {errors.otp && <p className="text-error text-xs text-center font-medium">{errors.otp}</p>}
                </div>

                <div className="space-y-1.5 mt-8">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">New Security Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">lock_reset</span>
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••" className="w-full pl-11 pr-11 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p className="text-error text-xs font-medium mt-1">{errors.password}</p>}
                </div>

                {errors.form && <div className="p-3 bg-error/10 border border-error/50 rounded-xl text-error text-xs text-center font-medium mt-4">{errors.form}</div>}
                
                <button type="submit" disabled={isLoading || otp.length !== 6 || newPassword.length < 6} className="w-full bg-white text-bg font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 mt-6 hover:bg-gray-200">
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              
              <div className="mt-8 text-xs text-text-muted">
                 <button onClick={() => setStep(1)} className="text-text-muted hover:text-white transition-colors border-b border-white/20 hover:border-white pb-1 tracking-wider uppercase font-medium">Wrong email? Go back</button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-text-muted">Remembered it? <Link to="/login" className="text-primary font-bold hover:text-white transition-colors underline underline-offset-4">Return to Login</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
