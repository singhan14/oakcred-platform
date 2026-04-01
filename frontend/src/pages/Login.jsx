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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.error_description || err?.message || 'Invalid credentials.';
      setErrors({ form: msg });
      toast.error(msg);
    }
  };

  return (
    <main className="flex min-h-screen bg-bg">
      {/* Left Panel - RESTORED PREMIUM DESIGN */}
      <section className="hidden md:flex flex-col justify-between w-[50%] bg-surface/30 p-12 relative overflow-hidden border-r border-border/50 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/10 to-transparent opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl uppercase">account_tree</span>
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
                <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-full font-label text-xs font-bold tracking-widest uppercase font-bold">AI Approved</span>
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

      {/* Right Panel - STANDARD LOGIN */}
      <section className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-border/50 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-2 uppercase tracking-tighter shadow-glow">Welcome back</h2>
            <p className="text-text-muted text-sm tracking-wide">Enter your credentials to access your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">mail</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="hello@oakcred.com" className="w-full pl-11 pr-4 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono" />
              </div>
              {errors.email && <p className="text-error text-xs font-medium mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-primary text-xs font-bold hover:text-white transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50 text-[18px]">lock</span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full pl-11 pr-11 py-3 bg-bg border border-border/50 rounded-xl text-white text-sm outline-none focus:border-primary/50 transition-all font-mono" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-error text-xs font-medium mt-1">{errors.password}</p>}
            </div>

            {errors.form && <div className="p-3 bg-error/10 border border-error/50 rounded-xl text-error text-xs">{errors.form}</div>}

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-white font-bold py-3.5 rounded-xl hover-glow transition-all uppercase tracking-widest disabled:opacity-50">
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-text-muted">Don't have an account? <Link to="/signup" className="text-primary font-bold hover:text-white transition-colors underline underline-offset-4">Create Workspace</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
