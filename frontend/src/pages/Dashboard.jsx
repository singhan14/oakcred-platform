import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import Button from '../components/ui/Button';

const verdictClass = (v) => v === 'LOAN_READY' ? 'text-success bg-success/10 border-success/20' : v === 'CONDITIONALLY_READY' ? 'text-warning bg-warning/10 border-warning/20' : v === 'UNDER_REVIEW' ? 'text-warning bg-warning/10 border-warning/20' : 'text-error bg-error/10 border-error/20';
const verdictLabel = (v) => v === 'LOAN_READY' ? 'Loan Ready' : v === 'CONDITIONALLY_READY' ? 'Conditional' : v === 'UNDER_REVIEW' ? 'Under Review' : 'Not Ready';
const scoreColor = (s) => s >= 75 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const user = useAuthStore(s => s.user);
  const [borrowers, setBorrowers] = useState([]);
  const [stats, setStats] = useState({ total: 0, ready: 0, review: 0, notReady: 0 });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/borrowers?limit=50'),
      api.get('/billing/subscription'),
    ]).then(([bData, sub]) => {
      const b = bData.data || [];
      setBorrowers(b);
      setSubscription(sub);
      const withAssessments = b.filter(x => x.assessments?.length > 0);
      setStats({
        total: bData.pagination?.total || b.length,
        ready: withAssessments.filter(x => x.assessments[0].verdict === 'LOAN_READY').length,
        review: withAssessments.filter(x => ['CONDITIONALLY_READY', 'UNDER_REVIEW'].includes(x.assessments[0].verdict)).length,
        notReady: withAssessments.filter(x => x.assessments[0].verdict === 'NOT_READY').length,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleExport = () => {
    toast.success('Preparing portfolio report export...');
    const headers = ['Name', 'Business Type', 'Industry', 'City', 'State', 'GSTIN', 'PAN', 'Credit Score', 'Verdict'];
    const rows = borrowers.map(b => [
      b.name, b.type, b.industry || '', b.city || '', b.state || '', b.gstin || '', b.pan,
      b.assessments?.[0]?.overallScore || 'N/A',
      b.assessments?.[0]?.verdict || 'PENDING'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `oakcred_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      <div className="skeleton h-80 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'Partner'}</h1>
          <p className="text-text-muted text-sm mt-2">{user?.firm?.name || 'Workspace'} · Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} variant="secondary" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">cloud_download</span> Export
          </Button>
          <Button to="/assessment/new" variant="primary" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> New Assessment
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL PORTFOLIO', value: stats.total, color: 'text-primary', border: 'border-primary', icon: 'group' },
          { label: 'LOAN READY', value: stats.ready, color: 'text-success', border: 'border-success', icon: 'verified_user' },
          { label: 'IN REVIEW', value: stats.review, color: 'text-warning', border: 'border-warning', icon: 'hourglass_empty' },
          { label: 'ASSESSMENTS', value: subscription?.assessmentsUsed || 0, color: 'text-info', border: 'border-info', icon: 'receipt_long', sub: `of ${subscription?.assessmentLimit || 0} limit` },
        ].map((card, i) => (
          <GlassCard key={i} hoverEffect className="relative overflow-hidden group">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${card.color.split('-')[1]} to-transparent opacity-50`} />
            <div className="flex items-center justify-between relative z-10 w-full">
              <div>
                <p className="text-[10px] font-label font-bold text-text-muted tracking-widest uppercase mb-1">{card.label}</p>
                <p className="text-4xl font-display font-bold text-white tracking-tight">{card.value}</p>
                {card.sub && <p className="text-[11px] text-text-muted mt-2">{card.sub}</p>}
              </div>
              <span className={`material-symbols-outlined text-[32px] ${card.color} opacity-80 group-hover:scale-110 transition-transform duration-500`}>{card.icon}</span>
            </div>
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl ${card.color.replace('text', 'bg')} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700`} />
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Risk Score Trend */}
          <GlassCard className="flex flex-col justify-center min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">Risk Score <GradientText>Trend</GradientText></h2>
              <select className="bg-surface2 border border-border/50 text-white text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
            {/* Dynamic Graph Placeholder */}
            <div className="flex-1 flex items-center justify-center pt-4 pb-2 relative group mt-4">
              <p className="text-white/30 text-sm font-medium italic z-20 mix-blend-screen drop-shadow-md">Accumulating trend data. Need 2+ months of history.</p>
              <div className="absolute inset-0 rounded-2xl bg-white/[0.01] backdrop-blur-sm z-10" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-10 blur-[1px]" />
            </div>
            <div className="flex justify-between text-[10px] font-label text-text-muted mt-6 uppercase tracking-wider">
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>Today</span>
            </div>
          </GlassCard>

          {/* Client Assessments Table */}
          <GlassCard className="p-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-surface2/30">
              <h2 className="font-display text-xl font-bold text-white">Recent Assessments</h2>
              <Link to="/borrowers" className="text-primary text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1 group">
                View all <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            
            {borrowers.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <span className="material-symbols-outlined text-white/40 text-2xl">inbox</span>
                </div>
                <p className="text-white font-medium mb-2">No assessments yet</p>
                <p className="text-text-muted text-sm mb-6">Process your first client to see real-time insights.</p>
                <Button to="/assessment/new" variant="primary">Start Analysis</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-label font-bold text-text-muted uppercase tracking-widest bg-surface2/50">
                      <th className="px-6 py-4">Borrower Entity</th>
                      <th className="px-4 py-4">AI Score</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-6 py-4 hidden sm:table-cell text-right">Last Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowers.slice(0, 5).map((b, i) => (
                      <tr key={b.id} className={`border-t border-border/30 hover:bg-surface2/50 transition-colors group cursor-pointer ${i % 2 === 0 ? 'bg-bg/20' : ''}`}>
                        <td className="px-6 py-4">
                          <Link to={`/borrowers/${b.id}`} className="font-medium text-white group-hover:text-primary transition-colors block">{b.name}</Link>
                          <span className="text-[11px] text-text-muted">{b.pan || 'Pending PAN'}</span>
                        </td>
                        <td className="px-4 py-4">
                          {b.assessments?.[0] ? (
                            <div className="flex items-center gap-2">
                              <span className={`font-display font-bold text-lg ${scoreColor(b.assessments[0].overallScore)}`}>
                                {b.assessments[0].overallScore}
                              </span>
                            </div>
                          ) : <span className="text-text-muted">-</span>}
                        </td>
                        <td className="px-4 py-4">
                          {b.assessments?.[0] ? (
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${verdictClass(b.assessments[0].verdict).replace('border-', 'shadow-')}`}>
                              {verdictLabel(b.assessments[0].verdict)}
                            </span>
                          ) : <span className="text-text-muted text-[10px] font-label tracking-wider bg-white/5 px-3 py-1.5 rounded-full">PENDING</span>}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-xs text-text-muted text-right">
                          {b.assessments?.[0] ? (() => {
                            const diff = Date.now() - new Date(b.assessments[0].createdAt).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            const days = Math.floor(hrs / 24);
                            return `${days}d ago`;
                          })() : "Waiting"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Panel */}
        <div className="space-y-8">
          
          {/* Recent Alerts */}
          <GlassCard>
            <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">notifications_active</span>
              Action Items
            </h3>
            <div className="space-y-3">
              {(() => {
                const aiAlerts = borrowers.flatMap(b => (b.assessments?.[0]?.aiInsights || [])
                  .filter(i => i.type === 'RISK' || i.type === 'HIGH')
                  .map(i => ({ message: `${i.title}: ${i.description}`, borrowerName: b.name }))
                );
                const legacyAlerts = borrowers.flatMap(b => (b.assessments?.[0]?.flags || [])
                  .filter(f => f.severity === 'HIGH')
                  .map(f => ({ message: f.message, borrowerName: b.name }))
                );
                const allAlerts = [...aiAlerts, ...legacyAlerts].slice(0, 4);

                if (allAlerts.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white/[0.01] rounded-3xl backdrop-blur-sm">
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-success opacity-80 text-3xl">check_circle</span>
                      </div>
                      <p className="text-sm text-text-muted font-medium">All clear. No high-severity items found.</p>
                    </div>
                  );
                }

                return allAlerts.map((a, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md transition-all cursor-pointer group shadow-sm border border-transparent hover:border-error/20 hover:shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                      <span className={`material-symbols-outlined text-[18px] text-error`}>warning</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-white truncate">{a.message}</h4>
                      <p className="text-xs text-text-muted mt-1 truncate font-medium">{a.borrowerName}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
            <button className="w-full mt-6 text-xs font-bold font-label tracking-wider uppercase text-text-muted hover:text-primary transition-colors">
              View All Alerts
            </button>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <h3 className="font-display text-lg font-bold text-white mb-6">Quick Links</h3>
            <div className="space-y-3">
              {[
                { to: '/assessment/new', icon: 'add_chart', label: 'New Assessment', desc: 'Analyze a new borrower', color: 'text-primary' },
                { to: '/borrowers', icon: 'folder_open', label: 'Portfolio Library', desc: 'Browse all active clients', color: 'text-info' },
                { to: '/monitoring', icon: 'radar', label: 'Live Monitoring', desc: 'Real-time risk tracking', color: 'text-warning' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md transition-all group border border-transparent hover:border-white/5">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white/10 transition-colors">
                    <span className={`material-symbols-outlined ${a.color} text-[22px] drop-shadow-md`}>{a.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-0.5">{a.label}</p>
                    <p className="text-xs text-text-muted font-medium">{a.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <span className="material-symbols-outlined text-white text-[16px]">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
