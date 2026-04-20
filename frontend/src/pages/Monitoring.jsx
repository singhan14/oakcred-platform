import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';

export default function Monitoring() {
  usePageTitle('Loan Monitoring');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/monitoring/dashboard').then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="skeleton h-96 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Loan <GradientText>Monitoring</GradientText></h1>
          <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase rounded flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI-Powered
          </span>
        </div>
        <p className="text-sm text-text-muted mt-2">Track post-disbursal health and early warning signals using AI telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-success text-[28px]">verified_user</span>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-white">{data?.stats?.active || 0}</p>
            <p className="text-xs font-bold tracking-widest uppercase text-text-muted mt-1">Healthy Loans</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shadow-inner">
             <span className="material-symbols-outlined text-warning text-[28px]">visibility</span>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-white">{data?.stats?.watch || 0}</p>
            <p className="text-xs font-bold tracking-widest uppercase text-text-muted mt-1">On Watchlist</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-5 p-6 md:p-8">
          <div className="w-14 h-14 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-error text-[28px]">warning</span>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-white">{data?.stats?.critical || 0}</p>
            <p className="text-xs font-bold tracking-widest uppercase text-text-muted mt-1">Critical Accounts</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50 bg-surface2/30">
          <h2 className="font-display text-xl font-bold text-white">Monitored Portfolio</h2>
        </div>
        
        {(!data?.monitors || data.monitors.length === 0) ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-text-muted opacity-30 text-5xl mb-4 block">monitoring</span>
            <p className="text-white font-medium mb-1">No active loans being monitored</p>
            <p className="text-sm text-text-muted">Connect your CBS or add disbursed loans to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border/50">
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Loan Amount</th>
                  <th className="px-6 py-4">Health</th>
                  <th className="px-6 py-4">Last Sync</th>
                  <th className="px-6 py-4">Warning Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {data.monitors.map((loan, i) => (
                  <tr key={i} className="hover:bg-surface2/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/borrowers/${loan.borrowerId}`} className="font-semibold text-white group-hover:text-primary transition-colors">{loan.borrower?.name}</Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-white">₹{loan.loanAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                        loan.outcomeLabel === 'GOOD' ? 'bg-success/10 text-success border-success/20' : 
                        loan.outcomeLabel === 'DELAYED' ? 'bg-warning/10 text-warning border-warning/20' : loan.outcomeLabel === 'DEFAULTED' ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'
                      }`}>{loan.outcomeLabel || loan.riskFlag}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-text-muted">
                      {new Date(loan.lastCheckedAt || loan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {loan.alerts > 0 ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-error">
                          <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                          {loan.riskFlag !== 'NONE' ? 1 : 0} alerts
                        </span>
                      ) : <span className="text-xs text-text-muted">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
