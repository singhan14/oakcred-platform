import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function Login() {
  usePageTitle('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
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
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.error || 'Invalid credentials. Please try again.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  return (
    <main className="flex min-h-screen bg-bg">
      {/* Left Panel */}
      <section className="hidden md:flex flex-col justify-between w-[50%] bg-surface/30 p-12 relative overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/10 to-transparent opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">account_tree</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Oak<span className="text-primary">Cred</span></h1>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center my-12">
          <div className="relative w-72 h-72 flex items-center justify-center group">
            <div className="absolute inset-0 rounded-full border border-border/50 bg-surface2/30 backdrop-blur-sm" />
            <div className="absolute inset-[-10px] rounded-full border border-primary/20 scale-100 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-r-transparent border-b-transparent -rotate-45" />
            <div className="text-center">
              <span className="font-display text-[7rem] font-bold text-white leading-none tracking-tighter shadow-glow">92</span>
              <div className="mt-4">
                <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-full font-label text-xs font-bold tracking-widest uppercase">AI Approved</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Credit Intelligence, Reimagined.</h2>
          <p className="text-text-muted text-lg mb-8 max-w-md">AI-powered credit assessment platform for modern lenders. Make smarter decisions, faster.</p>
          <div className="flex flex-wrap gap-3">
            {['1M+ Assessments', '$50B+ Underwritten', 'Instant Decisions'].map(s => (
              <div key={s} className="px-4 py-2 rounded-full bg-surface2 border border-border/50 backdrop-blur-md">
                <span className="font-mono text-text-muted text-xs font-medium tracking-wider uppercase">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel */}
      <section className="w-full md:w-[50%] p-8 md:p-16 flex flex-col relative justify-center items-center">
        <div className="md:hidden w-full max-w-md mb-8 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">account_tree</span>
          </div>
          <h1 className="font-display text-xl font-bold text-white">Oak<span className="text-primary">Cred</span></h1>
        </div>

        <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-border/50">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-text-muted">Sign in to your lender portal</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">mail</span>
                <input id="login-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined, form: undefined })); }}
                  placeholder="hello@lender.com" autoComplete="email" autoFocus
                  className={`w-full pl-11 pr-4 py-3 bg-bg border rounded-xl text-white text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner ${errors.email ? 'border-error/50 ring-1 ring-error/50' : 'border-border/50'}`} />
              </div>
              {errors.email && <p className="text-error text-xs font-medium mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="block text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
                <a className="text-primary text-xs font-medium hover:text-white transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">lock</span>
                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: undefined, form: undefined })); }}
                  placeholder="••••••••" autoComplete="current-password"
                  className={`w-full pl-11 pr-11 py-3 bg-bg border rounded-xl text-white text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner ${errors.password ? 'border-error/50 ring-1 ring-error/50' : 'border-border/50'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-error text-xs font-medium mt-1">{errors.password}</p>}
            </div>

            {errors.form && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
                <p className="text-error text-sm font-medium leading-relaxed">{errors.form}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-primary text-white font-bold py-3.5 rounded-xl hover-glow transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50">
              {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-text-muted leading-relaxed">
              Demo credentials: <br/>
              <span className="font-mono text-white/70 bg-surface px-2 py-0.5 rounded border border-border">demo@oakcred.com</span> / <span className="font-mono text-white/70 bg-surface px-2 py-0.5 rounded border border-border">Demo@1234</span>
            </p>
          </div>
        </div>

        <footer className="absolute bottom-8 w-full max-w-md flex justify-between items-center text-xs text-text-muted/50">
          <p>© {new Date().getFullYear()} OakCred. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="hover:text-white transition-colors" href="#">Privacy</a>
            <a className="hover:text-white transition-colors" href="#">Terms</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
