import GlassCard from '../../components/ui/GlassCard';
import GradientText from '../../components/ui/GradientText';
import Button from '../../components/ui/Button';

export default function About() {
  return (
    <div className="w-full">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative pt-40 pb-20 px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-7xl font-display font-bold text-white mb-6">
          Who We <GradientText>Are</GradientText>
        </h1>
        <p className="text-xl text-text-muted leading-relaxed">
          OakCred is building the future of credit intelligence for modern lenders.
        </p>
      </section>

      {/* ─── Mission Section ────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <GlassCard className="text-center md:py-16">
          <h2 className="text-sm font-label text-primary mb-4 tracking-widest">OUR MISSION</h2>
          <p className="text-2xl sm:text-4xl font-display font-medium text-white leading-tight max-w-4xl mx-auto">
            "We're on a mission to democratize access to AI-powered credit assessment tools, enabling lenders of all sizes to make data-driven decisions with confidence."
          </p>
        </GlassCard>
      </section>

      {/* ─── Strengths Section ──────────────────────────── */}
      <section className="py-16 border-y border-transparent bg-gradient-to-r from-transparent via-surface2/10 to-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-text-muted">
          <div className="group">
            <span className="material-symbols-outlined text-4xl mb-3 text-primary/70 group-hover:text-primary transition-all group-hover:scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">bolt</span>
            <p className="font-label text-sm tracking-widest text-white/90">LIGHTNING FAST<br/>DECISIONS</p>
          </div>
          <div className="group">
            <span className="material-symbols-outlined text-4xl mb-3 text-primary/70 group-hover:text-primary transition-all group-hover:scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">security</span>
            <p className="font-label text-sm tracking-widest text-white/90">INSTITUTIONAL GRADE<br/>SECURITY</p>
          </div>
          <div className="group">
            <span className="material-symbols-outlined text-4xl mb-3 text-primary/70 group-hover:text-primary transition-all group-hover:scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">memory</span>
            <p className="font-label text-sm tracking-widest text-white/90">PROPRIETARY ML<br/>MODELS</p>
          </div>
          <div className="group">
            <span className="material-symbols-outlined text-4xl mb-3 text-primary/70 group-hover:text-primary transition-all group-hover:scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">api</span>
            <p className="font-label text-sm tracking-widest text-white/90">SEAMLESS API<br/>INTEGRATION</p>
          </div>
        </div>
      </section>

      {/* ─── Values Grid ────────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard hoverEffect className="group text-center sm:text-left flex flex-col items-center sm:items-start p-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
               <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">lightbulb</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Innovation First</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              We push the boundaries of what's possible in credit technology, utilizing cutting-edge ML models.
            </p>
          </GlassCard>
          
          <GlassCard hoverEffect className="group text-center sm:text-left flex flex-col items-center sm:items-start p-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
               <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">verified_user</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Trust & Transparency</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              Built on a foundation of ethical AI, data integrity, and complete explainability in every score.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="group text-center sm:text-left flex flex-col items-center sm:items-start p-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
               <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">handshake</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Customer Success</h3>
            <p className="text-text-muted leading-relaxed text-lg">
              Your growth is our growth. We succeed when your portfolio scales safely and profitably.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ─── Team Section ───────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto bg-surface/20 border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">Meet the Team</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Updated Team Members */}
          {[
            { name: "Singhan Yadav", role: "Tech", img: "/singhan.png" },
            { name: "Ahan Mazumdar", role: "Research & Development", img: "/ahan.png" },
            { name: "Aaron Alex Luke", role: "Commercial", img: "/aaron.png" },
            { name: "Yashovardhan", role: "Operations Lead", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" }
          ].map((member, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 rounded-full mb-6 border-2 border-white/10 bg-surface2 overflow-hidden shadow-lg group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] group-hover:border-primary/50 transition-all duration-500 relative flex items-center justify-center">
                 {member.img ? (
                   <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 ) : (
                   <span className="material-symbols-outlined text-[64px] text-text-muted/50 group-hover:text-primary transition-all duration-700 group-hover:scale-110">person</span>
                 )}
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-1">{member.name}</h3>
              <p className="text-text-muted text-sm font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────── */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-8">
          Join the OakCred <GradientText>Revolution</GradientText>
        </h2>
        <div className="flex justify-center gap-4">
          <Button to="/dashboard" variant="primary" className="text-lg px-8 py-4">Get Started</Button>
          <Button to="/contact" variant="ghost" className="text-lg px-8 py-4">Contact Us</Button>
        </div>
      </section>
    </div>
  );
}
