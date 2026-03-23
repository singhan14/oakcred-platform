import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function Signup() {
  usePageTitle('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const { signUpWithEmail, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name) e.name = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signUpWithEmail(email, password);
      setIsSuccess(true);
      toast.success('Sign up successful!');
    } catch (err) {
      const msg = err?.message || 'Failed to sign up.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg p-6 text-center">
        <div className="glass-panel p-12 rounded-3xl max-w-lg border border-border/50 shadow-glow backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-4xl">mail</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4 uppercase tracking-tighter">Check your email</h2>
          <p className="text-text-muted text-lg leading-relaxed mb-10">
            Verification link sent to <span className="text-primary font-mono font-bold tracking-tight underline underline-offset-4">{email}</span>
          </p>
          <Link to="/login" className="px-10 py-4 bg-gradient-primary rounded-xl text-white font-bold hover-glow transition-all uppercase tracking-widest">Back to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-bg">
      {/* Left Panel - RESTORED PREMIUM DESIGN */}
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
          <h2 className="text-5xl font-display font-light text-white mb-6 leading-tight">Join the <span className="font-bold text-primary text-6xl">Elite</span> AI Network.</h2>
          <p className="text-text-muted text-xl mb-8 max-w-sm leading-relaxed">Institutional grade credit intelligence. Secure, automated, and precise.</p>
          <div className="flex gap-4">
             <div className="glass-panel px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-2xl font-bold text-white">0.1s</p>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Latency</p>
             </div>
             <div className="glass-panel px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Accuracy</p>
             </div>
          </div>
        </div>
      </section>

      <section className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-border/50 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-tighter shadow-glow">Create Account</h2>
            <p className="text-text-muted text-sm">Initialize your institutional lender workspace</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">person</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Master Admin" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono shadow-inner" />
              </div>
              {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Business Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">mail</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@oakcred.com" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono shadow-inner" />
              </div>
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Security Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">lock</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono shadow-inner" />
              </div>
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

            {errors.form && <div className="p-3 bg-error/10 border border-error/50 rounded-xl text-error text-xs text-center">{errors.form}</div>}

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-white font-bold py-4 rounded-xl hover-glow transition-all uppercase tracking-widest disabled:opacity-50">
              {isLoading ? 'Creating Gateway...' : 'Initialize Workspace'}
            </button>
          </form>

          <footer className="mt-8 text-center text-sm text-text-muted">
            Already verified? <Link to="/login" className="text-primary font-bold hover:text-white transition-colors underline underline-offset-4">Identity Sign In</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
