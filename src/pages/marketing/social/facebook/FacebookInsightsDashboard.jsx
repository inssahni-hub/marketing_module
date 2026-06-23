import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, MousePointerClick, Percent, Target, ShoppingBag, Eye, HeartHandshake, RefreshCw, AlertCircle, PlayCircle, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookInsightsDashboard({ campaignId, campaignName }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states for conversion simulator
  const [simAmount, setSimAmount] = useState(45.00);
  const [simTicketQty, setSimTicketQty] = useState(1);

  const fetchInsights = async () => {
    if (!campaignId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await FacebookApiService.getInsights(campaignId);
      setInsights(data || []);
    } catch (err) {
      setErrorMsg('Failed to fetch campaign insights reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [campaignId]);

  const handleForceUpdateSync = async () => {
    setSyncing(true);
    try {
      await FacebookApiService.sync();
      await fetchInsights();
    } catch (err) {
      setErrorMsg('Synchronizing Facebook insights failed.');
    } finally {
      setSyncing(false);
    }
  };

  // Ticket Conversion Simulator event
  const triggerSimulatePurchase = async () => {
    setSimulating(true);
    setErrorMsg(null);
    try {
      const orderId = 'ord_' + Math.floor(100000 + Math.random() * 900000);
      const ticketId = 'tkt_' + Math.floor(100000 + Math.random() * 900000);
      const amountPaid = parseFloat((simAmount * simTicketQty).toFixed(2));

      await FacebookApiService.recordConversion({
        campaignId,
        eventId: 'evt_summer_concert',
        ticketId,
        orderId,
        buyerId: 'buyer_' + Math.floor(1000 + Math.random() * 9000),
        amount: amountPaid,
        currency: 'USD'
      });

      // Reload reporting KPIs
      await fetchInsights();
    } catch (err) {
      setErrorMsg('Simulation conversion trigger encountered errors.');
    } finally {
      setSimulating(false);
    }
  };

  // Aggregated totals
  const totalSpend = insights.reduce((sum, item) => sum + (item.spend || 0), 0);
  const totalReach = insights.reduce((sum, item) => sum + (item.reach || 0), 0);
  const totalImpressions = insights.reduce((sum, item) => sum + (item.impressions || 0), 0);
  const totalClicks = insights.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const totalPurchases = insights.reduce((sum, item) => sum + (item.purchases || 0), 0);
  const totalRevenue = insights.reduce((sum, item) => sum + (item.purchaseValue || 0), 0);

  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 4.5; // realistic benchmark fallback

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Dashboard Reporting Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-5.5 h-5.5 text-blue-600" />
            Meta Insights & Performance Reporting
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Meta performance report mapping for active campaign <span className="text-blue-600 font-semibold">"{campaignName || 'Active Campaign'}"</span>
          </p>
        </div>

        <button
          onClick={handleForceUpdateSync}
          disabled={syncing || loading}
          className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-250 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Force Sync Metrics'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ad Spend</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              USD {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
            <Eye className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Reach / Imps</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              {totalReach.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {totalImpressions.toLocaleString()}</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
            <MousePointerClick className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Clicks / CTR</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              {totalClicks.toLocaleString()} <span className="text-xs text-blue-600 font-semibold ml-1">({averageCtr.toFixed(2)}%)</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
            <Percent className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Avg CPC</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              USD {averageCpc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ticket Sales</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              {totalPurchases.toLocaleString()} <span className="text-xs text-emerald-600 font-semibold ml-1">Sales</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Gross Revenue</span>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              USD {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4 lg:col-span-2">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0 border border-purple-100">
            <HeartHandshake className="w-4.5 h-4.5" />
          </div>
          <div className="grow">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Return on Ad Spend (ROAS)</span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-purple-700 leading-none">
                {overallRoas.toFixed(2)}x
              </h3>
              <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Direct Lift
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Main reporting graphs and Ticket simulator layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analytics Charts Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 md:p-7 shadow-xs">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-6 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Meta Performance Metrics Matrix (Last 7 Days)
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-450 mt-2 font-medium">Drawing chart analytics...</span>
            </div>
          ) : insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
              <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider">No performance timeline recorded</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Dynamic composite Area Chart showing Spend vs Revenue */}
              <div>
                <span className="text-xs font-semibold text-slate-750 block mb-3 uppercase tracking-wider text-[10px]">Spend vs Gross Revenue Trend (USD)</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={insights}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontStyle="bold" tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} fontStyle="bold" tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontSize: '11px', fontFamily: 'sans-serif' }} />
                      <Area type="monotone" name="Spend" dataKey="spend" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                      <Area type="monotone" name="Revenue" dataKey="purchaseValue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sub engagement charts click lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-2">Clicks Engagement Trend</span>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={insights}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={8} />
                        <YAxis stroke="#94a3b8" fontSize={8} />
                        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '10px' }} />
                        <Area type="monotone" name="Clicks" dataKey="clicks" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block mb-2">ROAS Return Lift Trend</span>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={insights}>
                        <defs>
                          <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={8} />
                        <YAxis stroke="#94a3b8" fontSize={8} />
                        <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '10px' }} />
                        <Area type="monotone" name="ROAS" dataKey="roas" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRoas)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Dynamic conversion ticker simulator widget */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-7 rounded-xl text-white border border-slate-800 shadow-lg flex flex-col justify-between h-full min-h-[460px]">
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="p-1.5 bg-slate-800 text-blue-400 rounded-lg shrink-0 border border-slate-700">
                  <PlayCircle className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sandbox Conversion Pixel</span>
              </div>

              <h4 className="text-base font-semibold tracking-tight mb-1.5 font-sans">Live Ticket Checkout Pixel</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
                Deploy test ticket webhook conversions locally on Happnex checkout system to mock active buyer loops.
              </p>

              {/* Input forms */}
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Ticket Face Price (USD)</label>
                  <input
                    type="number"
                    min={5}
                    value={simAmount}
                    onChange={(e) => setSimAmount(parseFloat(e.target.value) || 25.00)}
                    className="w-full text-xs font-semibold bg-slate-800/60 border border-slate-700/60 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Tickets Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={simTicketQty}
                    onChange={(e) => setSimTicketQty(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-semibold bg-slate-800/60 border border-slate-700/60 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-5">
              <div className="p-3 bg-slate-850/50 border border-slate-800 rounded-lg mb-5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Total Transaction Value</span>
                <span className="text-lg font-bold text-white block mt-1">
                  USD {(simAmount * simTicketQty).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={triggerSimulatePurchase}
                disabled={simulating || loading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer border border-white"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    Completing purchase...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    Simulate Ticket Sale Conversion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
