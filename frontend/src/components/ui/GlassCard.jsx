export default function GlassCard({ children, className = '', hoverEffect = false }) {
  return (
    <div 
      className={`relative bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 transition-all duration-500 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
        hoverEffect ? 'hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)] hover:border-white/[0.1] hover:-translate-y-2' : ''
      } ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50 pointer-events-none rounded-3xl"></div>
      {children}
    </div>
  );
}
