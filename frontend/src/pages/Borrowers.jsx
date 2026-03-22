import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';

const verdictClass = (v) => v === 'LOAN_READY' ? 'text-success bg-success/10 border-success/20' : v === 'CONDITIONALLY_READY' ? 'text-warning bg-warning/10 border-warning/20' : v === 'UNDER_REVIEW' ? 'text-warning bg-warning/10 border-warning/20' : v === 'NOT_READY' ? 'text-error bg-error/10 border-error/20' : 'text-text-muted bg-surface2 border-border';
const verdictLabel = (v) => v === 'LOAN_READY' ? 'Loan Ready' : v === 'CONDITIONALLY_READY' ? 'Conditional' : v === 'UNDER_REVIEW' ? 'Under Review' : v === 'NOT_READY' ? 'Not Ready' : '-';
const scoreColor = (s) => s >= 75 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';

export default function Borrowers() {
  usePageTitle('All Clients');
  const [borrowers, setBorrowers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [typeFilter, setTypeFilter] = useState('');

  const fetchData = () => {
    setLoading(true);
    let url = `/borrowers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (typeFilter) url += `&type=${typeFilter}`;
    api.get(url).then(d => {
      setBorrowers(d.data || []);
      setTotal(d.pagination?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Portfolio <GradientText>Library</GradientText></h1>
          <p className="text-text-muted text-sm mt-2">{total} borrower{total !== 1 ? 's' : ''} registered across all segments</p>
        </div>
        <Button to="/assessment/new" variant="primary" className="flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[18px]">person_add</span> Add Client
        </Button>
      </div>

      {/* Search & Filter */}
      <GlassCard className="p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-50 text-[20px] group-focus-within:text-primary group-focus-within:opacity-100 transition-colors">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by exact name, PAN, or GSTIN..."
            className="w-full pl-12 pr-4 py-3 bg-bg border border-border/50 rounded-lg text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" />
        </form>
        <div className="relative min-w-[180px]">
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full bg-bg border border-border/50 rounded-lg pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner appearance-none cursor-pointer">
            <option value="">All Segments</option>
            <option value="MSME">Commercial MSME</option>
            <option value="INDIVIDUAL">Retail Individual</option>
            <option value="PARTNERSHIP">Partnership Firm</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg bg-surface2/50" />)}
          </div>
        ) : borrowers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-text-muted text-2xl">search_off</span>
            </div>
            <p className="text-white font-medium mb-2">{search ? 'No clients match your search parameters' : 'Your portfolio is currently empty'}</p>
            <p className="text-text-muted text-sm mb-6">Start by adding your first borrower profile.</p>
            <Button to="/assessment/new" variant="primary">Add Client Profile</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-label font-bold text-text-muted uppercase tracking-widest bg-surface2/50 border-b border-border/50">
                  <th className="px-6 py-4">Borrower Entity</th>
                  <th className="px-4 py-4">AI Score</th>
                  <th className="px-4 py-4">Risk Status</th>
                  <th className="px-4 py-4 hidden md:table-cell">Segment</th>
                  <th className="px-4 py-4 hidden lg:table-cell">Consent</th>
                  <th className="px-4 py-4 hidden lg:table-cell">Runs</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((b, i) => (
                  <tr key={b.id} className={`border-b border-border/30 hover:bg-surface2/50 transition-colors group ${i % 2 === 0 ? 'bg-bg/20' : ''} last:border-0`}>
                    <td className="px-6 py-4">
                      <Link to={`/borrowers/${b.id}`} className="font-medium text-white group-hover:text-primary transition-colors block">{b.name}</Link>
                      <p className="text-xs text-text-muted mt-0.5">{b.businessName || b.gstin || b.pan || '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      {b.assessments?.[0] ? (
                        <span className={`font-display font-bold text-lg ${scoreColor(b.assessments[0].overallScore)}`}>
                          {b.assessments[0].overallScore}
                        </span>
                      ) : <span className="text-text-muted">-</span>}
                    </td>
                    <td className="px-4 py-4">
                      {b.assessments?.[0] ? (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${verdictClass(b.assessments[0].verdict)}`}>
                          {verdictLabel(b.assessments[0].verdict)}
                        </span>
                      ) : <span className="text-text-muted text-[10px] font-label tracking-wider border border-border/50 px-2 py-1 rounded-md">PENDING</span>}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-md bg-surface2 border border-border/50 text-text-muted text-[10px] font-label tracking-widest uppercase">{b.type}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${b.consentStatus === 'ACTIVE' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                        {b.consentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell font-mono text-sm text-text-muted">{b._count?.assessments || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/borrowers/${b.id}`} className="inline-flex items-center justify-center p-2 rounded-lg bg-surface2 border border-border/50 text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all hover:bg-primary/10">
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface2/30">
            <p className="text-xs text-text-muted font-medium">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-border/50 bg-surface text-xs font-bold text-white disabled:opacity-30 hover:bg-surface2 hover:border-border transition-colors uppercase tracking-wider">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-border/50 bg-surface text-xs font-bold text-white disabled:opacity-30 hover:bg-surface2 hover:border-border transition-colors uppercase tracking-wider">Next</button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
