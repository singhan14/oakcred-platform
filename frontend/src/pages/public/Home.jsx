import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import GradientText from '../../components/ui/GradientText';
import HeroGraphic from '../../components/ui/HeroGraphic';

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-bg to-bg opacity-50 blur-[100px]"></div>
      </div>

      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Notification Pill Removed per feedback */}
        
        <h1 className="text-5xl sm:text-7xl font-display font-bold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Credit Intelligence, <br className="hidden sm:block" />
          <GradientText>Reimagined.</GradientText>
        </h1>
        
        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-body">
          AI-powered credit assessment platform for modern lenders. Make smarter decisions, faster. Reduce risk and increase approval rates with institutional-grade ML models.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button to="/dashboard" target="_blank" variant="primary" className="w-full sm:w-auto text-lg px-8 py-4">
            Launch Portal
          </Button>
          <Button to="/about" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
            Learn More
          </Button>
        </div>
        
        {/* Premium Coded UI Graphic */}
        <div className="mt-24 w-full max-w-5xl z-20">
          <HeroGraphic />
        </div>
      </section>

      {/* ─── Social Proof ──────────────────────────── */}
      <section className="relative z-10 py-12 border-y border-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-label text-text-muted mb-8">TRUSTED BY FORWARD-THINKING LENDERS</p>
          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <h3 className="text-xl font-display font-bold text-white tracking-widest">NEXA<span className="text-primary">BANK</span></h3>
            <h3 className="text-xl font-display font-semibold text-white tracking-widest">AURA<span className="font-light">CAPITAL</span></h3>
            <h3 className="text-xl font-display font-black text-white italic">Vertex<span className="text-primary">Finance</span></h3>
            <h3 className="text-xl font-display font-medium text-white tracking-tight">OVAL<span className="font-bold">CREDIT</span></h3>
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────── */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6">
            The New Standard in <GradientText>Risk Assessment</GradientText>
          </h2>
          <p className="text-text-muted text-lg">
            Stop relying on outdated scorecards. Our platform uses machine learning to uncover deep credit insights previously invisible to traditional methods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard hoverEffect className="group">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <span className="material-symbols-outlined text-primary text-3xl">memory</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">AI Risk Scoring</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              Proprietary ML models analyze thousands of data points to deliver highly accurate, alternative credit risk scores in seconds.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="group">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">Real-time Monitoring</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              Track your portfolio health with live dashboards. Get instant alerts when a borrower's credit profile shows early signs of distress.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="group">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <span className="material-symbols-outlined text-primary text-3xl">description</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">Instant Reports</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              Generate comprehensive, compliance-ready intelligence reports with a single click. Share securely with stakeholders.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────── */}
      <section className="relative z-10 py-32 px-6 bg-surface/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6">Built for <GradientText>Speed</GradientText></h2>
            <p className="text-text-muted text-lg">A frictionless workflow designed to approve loans faster without compromising on risk control.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative mt-16">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-bg/50 backdrop-blur-md border hover:border-primary/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 font-display font-bold text-3xl text-white/50 group-hover:text-white transition-all duration-500">1</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">Submit Application</h3>
              <p className="text-text-muted text-lg">Upload borrower financials or sync directly via our secure API connections.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary/10 backdrop-blur-md border border-primary/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex items-center justify-center mb-8 font-display font-bold text-3xl text-primary animate-pulse group-hover:scale-110 transition-transform duration-500">2</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">AI Analysis</h3>
              <p className="text-text-muted text-lg">Our engine processes data, checks compliance, and calculates the OakCred AI Score.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-bg/50 backdrop-blur-md border hover:border-primary/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 font-display font-bold text-3xl text-white/50 group-hover:text-white transition-all duration-500">3</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">Get Decision</h3>
              <p className="text-text-muted text-lg">Review the interactive dashboard and issue your lending decision instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────── */}
      <section className="relative z-10 py-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-6xl font-display font-bold text-white mb-8">
          Ready to transform your <GradientText>credit process?</GradientText>
        </h2>
        <p className="text-text-muted text-lg mb-10">
          Join the forward-thinking lenders who are already using OakCred to scale their loan books safely.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/dashboard" variant="primary" className="w-full sm:w-auto text-lg px-8 py-4">
            Start Free Trial
          </Button>
          <Button to="/contact" variant="ghost" className="w-full sm:w-auto text-lg px-8 py-4 border border-transparent">
            Contact Sales
          </Button>
        </div>
      </section>
    </div>
  );
}
