import React, { useState, useEffect } from 'react';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import { 
  CreditCard, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

export default function SMSMarketingPlans({ onUpdateCredits }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentUsage, setCurrentUsage] = useState(null);
  
  const [upgradingId, setUpgradingId] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setErrorText('');
      
      const billingRes = await smsApiService.getBillingPlans();
      if (billingRes.success) setPlans(billingRes.data);

      const usageRes = await smsApiService.getCurrentPlanAndUsage();
      if (usageRes.success) {
        setCurrentUsage(usageRes.data);
        if (onUpdateCredits && usageRes.data.usage) {
          onUpdateCredits(usageRes.data.usage);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorText('Failed to sync plan data with subscription server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, []);

  const handleUpgrade = async (planName) => {
    try {
      setUpgradingId(planName);
      setErrorText('');
      setSuccessText('');

      const res = await smsApiService.upgradeQuotaPlan({ planName });
      if (res.success) {
        setSuccessText(`Successfully updated subscription limits to the ${planName} Plan!`);
        // refresh data
        await fetchPlanData();
        // trigger global window event for components to reload
        window.dispatchEvent(new Event('active_tenant_changed'));
      } else {
        setErrorText(res.error || 'Upgrade failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorText('Database billing record exception.');
    } finally {
      setUpgradingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Syncing billing registry...</p>
      </div>
    );
  }

  const activePlanName = currentUsage?.plan?.planName || 'Basic';
  const usageStats = currentUsage?.usage || {};

  // Calculate percentage progress spent
  const limit = usageStats.smsLimit || 500;
  const sent = usageStats.smsSent || 0;
  const remaining = usageStats.smsRemaining || 500;
  const spendPct = Math.round((sent / limit) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">SMS Marketing Plans & Balances</h1>
          <p className="text-xs text-gray-500">Monitor multi-tenant monthly transmission billing rates and raise credits limits.</p>
        </div>
      </div>

      {/* Upgrades Notification alerts */}
      {successText && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-[#22c55e] font-semibold flex items-center space-x-2 animate-bounce">
          <Check className="h-4 w-4 bg-[#22c55e] text-white rounded-full p-0.5" />
          <span>{successText}</span>
        </div>
      )}

      {errorText && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-[#ef4444] font-semibold flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Shared Component: Usage Rings summary */}
      <div className="bg-white p-6 border border-blue-100 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="space-y-3 flex-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Usage Analytics</span>
          <h3 className="font-extrabold text-slate-800 text-base">Monthly Credit Quota Balance</h3>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed">
            Your billing cycle resets automatically every 30 days. Unused messages do not roll over to next month's bucket.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-3 text-xs text-gray-600 border-t border-blue-50">
            <div>
              <p className="text-gray-400 font-medium">Plan Level:</p>
              <p className="font-extrabold text-[#2189ed] text-sm mt-0.5">{activePlanName}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Credits Sent:</p>
              <p className="font-extrabold text-gray-800 text-sm mt-0.5">{sent} texts</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Renewal Date:</p>
              <p className="font-semibold text-gray-700 text-sm mt-0.5">
                {usageStats.renewalDate ? new Date(usageStats.renewalDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Giant visual slider / ring meter */}
        <div className="w-full md:w-64 space-y-2 text-center text-xs">
          <div className="flex justify-between font-bold text-gray-700 mb-1">
            <span>Remaining Volume</span>
            <span className="text-[#2189ed]">{remaining} / {limit} left</span>
          </div>
          <div className="w-full bg-blue-100 h-4 rounded-full overflow-hidden flex shadow-inner relative">
            <div 
              className="bg-[#2189ed] h-full transition-all flex items-center justify-end pr-2 text-[9px] font-extrabold text-white" 
              style={{ width: `${Math.max(5, 100 - spendPct)}%` }}
            >
              <span>{100 - spendPct}%</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Meter representing depleted monthly usage.</p>
        </div>

      </div>

      {/* Subscription Pricing grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrentPlan = activePlanName.toLowerCase() === p.name.toLowerCase();
          
          return (
            <div 
              key={p.id}
              className={`bg-white rounded-2xl p-6 border flex flex-col justify-between space-y-6 relative hover:shadow-md transition ${
                isCurrentPlan ? 'border-2 border-[#2189ed] shadow-sm' : 'border-blue-100'
              }`}
            >
              
              {isCurrentPlan && (
                <span className="bg-[#2189ed] text-white text-[9px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-xs">
                  Active Subscription
                </span>
              )}

              {/* Card headers details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{p.name}</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-extrabold text-gray-800">${p.price}</span>
                    <span className="text-gray-400 text-xs font-semibold ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">{p.limit.toLocaleString()} SMS messages / month Included.</p>
                </div>

                <div className="w-full h-px bg-blue-50"></div>

                {/* Features listings */}
                <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
                  {p.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <button
                disabled={isCurrentPlan || upgradingId !== null}
                onClick={() => handleUpgrade(p.name)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  isCurrentPlan 
                    ? 'bg-slate-50 text-gray-400 border border-blue-100/50 cursor-not-allowed'
                    : 'bg-[#2189ed] hover:bg-[#1b74ca] text-white shadow-sm hover:shadow active:scale-95'
                }`}
              >
                {upgradingId === p.name ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>{isCurrentPlan ? 'Active Plan' : `Upgrade to ${p.name}`}</span>
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}
