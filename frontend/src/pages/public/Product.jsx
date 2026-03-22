import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import GradientText from '../../components/ui/GradientText';
import usePageTitle from '../../hooks/usePageTitle';
import MonitoringMockup from '../../components/ui/mockups/MonitoringMockup';
import ScoringMockup from '../../components/ui/mockups/ScoringMockup';
import LegacyUIMockup from '../../components/ui/mockups/LegacyUIMockup';
import OakCredUIMockup from '../../components/ui/mockups/OakCredUIMockup';

export default function Product() {
  usePageTitle('Product');

  return (
    <div className="relative w-full overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/5 via-bg to-bg opacity-50 blur-[120px] pointer-events-none z-0"></div>

      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative z-10 pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight mb-6 leading-tight">
          Credit Decisions Driven by <br />
          <GradientText>Pure Intelligence.</GradientText>
        </h1>
        <p className="text-lg sm:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
          OakCred transforms unstructured financial data into actionable lending decisions in seconds, eliminating human error and manual bottlenecks.
        </p>
        <div className="flex justify-center">
          <Button to="/dashboard" target="_blank" variant="primary" className="text-lg px-8 py-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            Explore the Platform
          </Button>
        </div>
      </section>

      {/* ─── The Problem vs The OakCred Way ──────────── */}
      <section className="relative z-10 py-24 px-6 bg-surface/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            
            {/* The Old Way */}
            <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/5 relative overflow-hidden group flex flex-col h-full">
              <h3 className="flex items-center gap-3 text-2xl font-display font-bold text-white mb-2">
                <span className="material-symbols-outlined text-red-500">cancel</span>
                The Old Way
              </h3>
              <p className="text-text-muted mb-8 leading-relaxed">Manual workflows, zero visibility into alternative data, and reactive risk management that causes good borrowers to churn.</p>
              <div className="flex-1 mt-auto flex items-end">
                <LegacyUIMockup />
              </div>
            </div>

            {/* The OakCred Way */}
            <div className="p-8 rounded-3xl border border-primary/30 bg-primary/5 relative overflow-hidden group shadow-[0_0_50px_rgba(245,158,11,0.05)] flex flex-col h-full">
              <h3 className="flex items-center gap-3 text-2xl font-display font-bold text-white mb-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                The OakCred Way
              </h3>
              <p className="text-text-muted mb-8 leading-relaxed">Instant API decisions, proactive portfolio monitoring, and deep machine learning that uncovers hidden prime borrowers.</p>
              <div className="flex-1 mt-auto flex items-end">
                <OakCredUIMockup />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Core Features ───────────────────────────── */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-20 text-center">
          Comprehensive Platform <br />
          <GradientText>Capabilities</GradientText>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
          <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden border border-border/50 bg-bg p-2 shadow-2xl">
            <ScoringMockup />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-display font-bold text-white mb-6">Institutional-Grade ML Scoring</h3>
            <p className="text-text-muted text-lg mb-8 leading-relaxed">
              Our core scoring engine utilizes advanced ensemble models trained on millions of financial records. It automatically structures messy GST returns, bank statements, and bureau data to generate the predictive **OakCred Score**.
            </p>
            <ul className="space-y-4 text-text-muted">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Bank Statement Analysis Engine</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> GST & Tax Filing Verification</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Cross-entity Pattern Recognition</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-display font-bold text-white mb-6">Live Portfolio Monitoring</h3>
            <p className="text-text-muted text-lg mb-8 leading-relaxed">
              Lending isn't fire-and-forget. The OakCred Continuous Monitoring suite acts as your 24/7 automated risk team, scanning your entire active loan book for subtle shifts in borrower behavior.
            </p>
            <ul className="space-y-4 text-text-muted">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Automated Early Warning Signals (EWS)</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Bounce & Overdue Prediction Alerts</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Dynamic Limit Management Recommendations</li>
            </ul>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-bg p-2 shadow-2xl">
            <MonitoringMockup />
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* ─── Security & Trust ──────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-bg border-y border-border/50">
        <div className="max-w-7xl mx-auto text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6">shield_lock</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">Bank-Grade Security Architecture</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-16">
            We handle sensitive financial data for institutional lenders every day. Security isn't a feature; it's our foundational layer.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <GlassCard className="p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">SOC2 Type II</h4>
              <p className="text-sm text-text-subtle">Audited and certified infrastructure operations.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">AES-256</h4>
              <p className="text-sm text-text-subtle">Military-grade encryption at rest and in transit.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">Data Residency</h4>
              <p className="text-sm text-text-subtle">100% localized data hosting in native regions.</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">Zero Trust</h4>
              <p className="text-sm text-text-subtle">Strict access controls and audit logging.</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────── */}
      <section className="relative z-10 py-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-8">
          Ready to scale your loan book safely?
        </h2>
        <div className="flex justify-center">
          <Button to="/dashboard" target="_blank" variant="primary" className="text-lg px-8 py-4">
            Access The Platform
          </Button>
        </div>
      </section>
    </div>
  );
}
