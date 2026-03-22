import { useState, useEffect } from 'react';
import { api } from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';

export default function Billing() {
  usePageTitle('Billing & Plans');
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/billing/plans'),
      api.get('/billing/subscription')
    ]).then(([p, s]) => {
      setPlans(p);
      setSubscription(s);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to load billing information');
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (planId) => {
    setActionLoading(planId);
    try {
      const res = await api.post('/billing/subscribe', { planId });
      toast.success(res.message || 'Subscription updated');
      
      // Auto-verify mock payment
      if (res.subscription) {
        const sub = await api.get('/billing/subscription');
        setSubscription(sub);
      }
    } catch (err) {
      toast.error(err?.error || 'Subscription failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your active subscription? You will lose access to premium features at the end of your billing period.')) return;
    setActionLoading('cancel');
    try {
      await api.delete('/billing/subscription');
      toast.success('Subscription cancelled');
      const sub = await api.get('/billing/subscription');
      setSubscription(sub);
    } catch (err) {
      toast.error(err?.error || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="skeleton h-32 rounded-xl" />
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-96 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Billing & <GradientText>Subscription</GradientText></h1>
        <p className="text-sm text-text-muted mt-1">Manage your firm's plan and assessment quotas</p>
      </div>

      {/* Current Subscription Box */}
      {subscription && (
        <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-3xl font-bold text-white tracking-tight">{subscription.plan} Plan</h2>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                subscription.status === 'ACTIVE' ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-warning/10 text-warning border-warning/20'
              }`}>
                {subscription.status}
              </span>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-8">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Assessments Consumed</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl text-white font-bold">{subscription.assessmentsUsed}</span>
                  <span className="text-sm text-text-muted font-medium">/ {subscription.assessmentLimit === 0 ? 'Unlimited' : subscription.assessmentLimit}</span>
                </div>
              </div>
              {subscription.expiry && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Renews On</p>
                  <p className="text-xl font-display font-bold text-white">{new Date(subscription.expiry).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 w-full md:w-96 h-1.5 bg-surface2 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 relative ${subscription.assessmentsUsed >= subscription.assessmentLimit * 0.9 ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${Math.min((subscription.assessmentsUsed / (subscription.assessmentLimit || 1)) * 100, 100)}%` }} 
              >
                 <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-auto flex justify-end">
            {subscription.status === 'ACTIVE' && subscription.plan !== 'TRIAL' ? (
              <button 
                onClick={handleCancel} disabled={actionLoading === 'cancel'}
                className="text-[10px] font-bold tracking-widest uppercase text-error/80 hover:text-error transition-colors disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            ) : null}
          </div>
        </GlassCard>
      )}

      {/* Plans */}
      <div>
        <h3 className="font-display text-2xl font-bold text-white mb-6">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isCurrent = subscription?.plan === plan.id;
            const isPopular = plan.popular;
            
            return (
              <GlassCard key={plan.id} className={`p-0 relative flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 group ${isPopular ? 'border-primary/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-border/50'}`}>
                {isPopular && (
                   <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-100 pointer-events-none" />
                )}
                
                <div className="p-8 flex-1 relative z-10">
                  {isPopular && (
                    <div className="inline-block bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md mb-4 shadow-sm">
                      Recommended
                    </div>
                  )}
                  <h4 className="font-display text-2xl font-bold text-white">{plan.name}</h4>
                  <p className="text-sm text-text-muted mt-2 min-h-[40px] opacity-80">{plan.subtitle}</p>
                  
                  <div className="mt-6 mb-8 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold text-white tracking-tighter shadow-sm">₹{(plan.price / 100).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">/ Mo</span>
                  </div>
                  
                  <ul className="space-y-4 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span className="text-white opacity-90">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-8 pt-0 mt-auto relative z-10">
                  <Button 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || actionLoading}
                    variant={isPopular && !isCurrent ? 'primary' : 'secondary'}
                    className={`w-full py-4 flex justify-center items-center shadow-lg ${isCurrent ? 'bg-success/10 text-success border-success/20 opacity-100 cursor-default shadow-none hover:bg-success/10 hover:text-success' : ''}`}
                  >
                    {actionLoading === plan.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : null}
                    {isCurrent ? 'Current Plan' : actionLoading === plan.id ? 'Processing...' : 'Select Plan'}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
      
      {/* Informational Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <GlassCard className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-info text-[24px]">contact_support</span>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1 tracking-wide">Enterprise Requirements</h4>
            <p className="text-sm text-text-muted opacity-90 leading-relaxed">Scaling beyond limits? Enterprise SLAs offer unlimited quotas, custom API throughput, and dedicated account management. <span className="text-primary hover:underline cursor-pointer block mt-1 text-[10px] font-bold uppercase tracking-widest">Contact Sales</span></p>
          </div>
        </GlassCard>
        <GlassCard className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-success text-[24px]">security</span>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1 tracking-wide">Secure Infrastructure</h4>
            <p className="text-sm text-text-muted opacity-90 leading-relaxed">End-to-end encrypted pipelines. Payment processing via strict PCI-DSS compliant gateways. No static card data retained on our servers.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
