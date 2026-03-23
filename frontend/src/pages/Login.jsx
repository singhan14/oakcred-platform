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
  const { login, signInWithSSO, isLoading } = useAuthStore();
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

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg px-2 text-text-muted font-bold tracking-widest">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => signInWithSSO('google')} disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 bg-surface border border-border/50 rounded-xl hover:bg-surface2 transition-all group disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">Google</span>
              </button>
              <button type="button" onClick={() => signInWithSSO('azure')} disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 bg-surface border border-border/50 rounded-xl hover:bg-surface2 transition-all group disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 23 23"><path fill="#f35325" d="M0 0h10.75v10.75H0z"/><path fill="#81bc06" d="M12.25 0H23v10.75H12.25z"/><path fill="#05a6f0" d="M0 12.25h10.75V23H0z"/><path fill="#ffba08" d="M12.25 12.25H23V23H12.25z"/></svg>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">Microsoft</span>
              </button>
            </div>
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
