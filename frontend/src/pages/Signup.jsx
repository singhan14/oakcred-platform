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
      toast.success('Sign up successful! Please check your email for confirmation.');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to sign up. Please try again.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg p-6 text-center">
        <div className="glass-panel p-12 rounded-3xl max-w-lg border border-border/50">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">mail</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4 italic">Check your email</h2>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            We've sent a magic link to <span className="text-primary font-mono">{email}</span>. Click it to verify your account and start your credit journey.
          </p>
          <Link to="/login" className="px-8 py-3 bg-gradient-primary rounded-xl text-white font-bold hover-glow transition-all">Back to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-bg">
      {/* Left Panel - Reusable from Login */}
      <section className="hidden md:flex flex-col justify-between w-[50%] bg-surface/30 p-12 relative overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl uppercase italic">account_tree</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white italic">Oak<span className="text-primary">Cred</span></h1>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-display font-light text-white mb-6 leading-tight italic">Empower your <span className="font-bold text-primary">lending</span> with AI intelligence.</h2>
          <p className="text-text-muted text-lg mb-8 max-w-sm italic">Join the next generation of credit assessment platforms. Automated, efficient, and precise.</p>
        </div>
      </section>

      {/* Right Panel - Signup Form */}
      <section className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-border/50">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2 italic uppercase">Create Account</h2>
            <p className="text-text-muted italic">Start your 14-day free trial today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest italic">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">person</span>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: undefined })); }}
                  placeholder="Singhan Yadav" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono italic" />
              </div>
              {errors.name && <p className="text-error text-xs mt-1 italic">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest italic">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">mail</span>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined })); }}
                  placeholder="hello@oakcred.com" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono italic" />
              </div>
              {errors.email && <p className="text-error text-xs mt-1 italic">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest italic">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">lock</span>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: undefined })); }}
                  placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono italic" />
              </div>
              {errors.password && <p className="text-error text-xs mt-1 italic">{errors.password}</p>}
            </div>

            {errors.form && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-error text-sm italic">{errors.form}</div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-primary text-white font-bold py-3.5 rounded-xl hover-glow transition-all disabled:opacity-50 italic uppercase tracking-widest">
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>

          <footer className="mt-8 text-center text-sm text-text-muted italic">
            Already have an account? <Link to="/login" className="text-primary hover:text-white transition-colors">Sign in</Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
