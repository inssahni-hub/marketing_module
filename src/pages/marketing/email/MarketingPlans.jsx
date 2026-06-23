import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, ShieldCheck, Heart, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function MarketingPlans() {
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPlansAndUsage();
  }, []);

  const fetchPlansAndUsage = async () => {
    try {
      setLoading(true);
      setError('');
      const [plansRes, usageRes] = await Promise.all([
        emailApi.getPlans(),
        emailApi.getUsage()
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (usageRes.success) setUsage(usageRes.data);
    } catch (err) {
      setError(err.message || 'Error occurred pulling pricing systems.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId, planName) => {
    if (!window.confirm(`Swap subscription tier immediately to: "${planName}"?\n\nThis will reset monthly quota consumption metrics on our Express Multi-Tenant database and unlock higher SendGrid outbound limits.`)) return;
    try {
      setLoading(true);
      const res = await emailApi.subscribePlan(planId);
      if (res.success) {
        setSuccessMsg(`Successfully subscribed to "${planName}"! Your outbound limits are refreshed.`);
        
        // Save upgraded profile details inside localStorage
        const profile = emailApi.getCurrentOrganizer();
        if (profile) {
          profile.plan = planName;
          localStorage.setItem('organizer_profile', JSON.stringify(profile));
        }

        setTimeout(() => setSuccessMsg(''), 5000);
        fetchPlansAndUsage();
      } else {
        setError(res.error || 'Failed to apply subscription model swaps.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !usage) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2189ed]"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium whitespace-nowrap">Gathering pricing grids...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Ribbons heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Marketing Plans & Limits</h2>
          <p className="text-xs text-slate-400 mt-1">Acquire bulk email quotas, manage multi-tenant tiers, and review real-time monthly usage profiles.</p>
        </div>
        <button 
          onClick={fetchPlansAndUsage}
          className="p-2.5 text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition self-start md:self-auto"
          title="Refresh Quota"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Quota progressed widget usage */}
      {usage && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b mb-4">Active Monthly Consumption Ratio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="md:col-span-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Outbound Limit Quota ({usage.data?.activePlanName || 'Basic'} tier)</span>
                <span>{usage.data?.emailsSent?.toLocaleString()} / {usage.data?.limitTotal?.toLocaleString()} sent</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2189ed] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((usage.data?.emailsSent / (usage.data?.limitTotal || 5000)) * 100))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Reset interval: Cyclic. Current period ends: <strong className="text-slate-700">{usage.data?.currentPeriodEnd ? new Date(usage.data.currentPeriodEnd).toLocaleDateString() : 'N/A'}</strong></p>
            </div>

            <div className="bg-[#eef6ff] p-4 rounded-xl border border-[#2189ed]/10 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available outbound balance</p>
              <h4 className="text-2xl font-bold text-[#2189ed]">{usage.data?.emailsRemaining?.toLocaleString()}</h4>
              <p className="text-[9px] text-[#1b74ca] font-semibold mt-1 uppercase">Valid this period</p>
            </div>

          </div>
        </div>
      )}

      {/* SaaS Pricing cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((pl) => {
          const isActive = usage?.data?.activePlanName === pl.planName;
          
          return (
            <div 
              key={pl._id} 
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-xs relative overflow-hidden transition hover:shadow-md ${isActive ? 'border-2 border-[#2189ed]' : 'border-slate-100'}`}
            >
              {isActive && (
                <span className="absolute top-3.5 right-3.5 bg-[#2189ed] text-white text-[9px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                  Active Subscription
                </span>
              )}

              <div>
                {/* Visual badge top */}
                <div className="flex items-center gap-2 mb-4">
                  {pl.planName === 'Basic' && <Heart className="w-5 h-5 text-pink-500" />}
                  {pl.planName === 'Professional' && <Zap className="w-5 h-5 text-amber-500" />}
                  {pl.planName === 'Enterprise' && <ShieldCheck className="w-5 h-5 text-purple-600" />}
                  <h4 className="font-bold text-slate-800 text-lg">{pl.planName} Plan</h4>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">${pl.price}</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">/ month</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <strong>{pl.emailLimit?.toLocaleString()} Outbound emails</strong> per month limit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Strict Multi-Tenant data isolation layers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    SendGrid Mail API integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Immediate schedule engine daemon
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                {isActive ? (
                  <button 
                    disabled
                    className="w-full py-2.5 bg-slate-100 text-slate-400 disabled:pointer-events-none text-xs font-bold rounded-lg text-center font-mono"
                  >
                    Current Active plan
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSubscribe(pl._id, pl.planName)}
                    className="w-full py-2.5 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-bold rounded-lg text-center transition shadow-sm"
                  >
                    Subscribe Tier / Upgrade
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
