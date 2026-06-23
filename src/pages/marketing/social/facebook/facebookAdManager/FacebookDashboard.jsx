import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Layers, 
  PlayCircle, 
  DollarSign, 
  Users, 
  Ticket, 
  Percent, 
  RefreshCw, 
  Link2, 
  AlertCircle,
  Eye,
  MousePointerClick
} from 'lucide-react';

export default function FacebookDashboard({ 
  dashboard, 
  connection, 
  viewCampaignDetails, 
  handleRefresh, 
  isLoading 
}) {
  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="h-32 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="h-80 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { kpis, trends } = dashboard;
  const isSandbox = !connection || !connection.connected;

  // Formatting metrics helpers
  const safeVal = (val, formatFn = (x) => x) => {
    if (val === undefined || val === null || val === 'N/A') return 'N/A';
    return formatFn(val);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const kpiCards = [
    {
      title: 'Total Campaigns',
      value: safeVal(kpis.totalCampaigns, formatNumber),
      icon: Layers,
      color: 'bg-blue-55 bg-blue-50/10 text-[#2189ed]',
      description: 'Connected ad campaign scope'
    },
    {
      title: 'Active Campaigns',
      value: safeVal(kpis.activeCampaigns, formatNumber),
      icon: PlayCircle,
      color: 'bg-emerald-55 bg-emerald-50/10 text-emerald-600',
      description: 'Currently delivering ads live'
    },
    {
      title: 'Total Spend',
      value: safeVal(kpis.totalSpend, formatCurrency),
      icon: DollarSign,
      color: 'bg-amber-55 bg-amber-50/10 text-amber-600',
      description: 'Ad budget spent to date'
    },
    {
      title: 'Ad Reach',
      value: safeVal(kpis.totalReach, formatNumber),
      icon: Users,
      color: 'bg-indigo-55 bg-indigo-50/10 text-indigo-600',
      description: 'Unique accounts targeted'
    },
    {
      title: 'Ticket Sales',
      value: safeVal(kpis.ticketSales, formatNumber),
      icon: Ticket,
      color: 'bg-rose-55 bg-rose-50/10 text-rose-500',
      description: 'Attributed conversion ticket buys'
    },
    {
      title: 'Total Clicks',
      value: safeVal(kpis.totalClicks, formatNumber),
      icon: MousePointerClick,
      color: 'bg-violet-55 bg-violet-50/10 text-violet-600',
      description: 'Total prospective click interactions'
    },
    {
      title: 'Attributed Revenue',
      value: safeVal(kpis.totalRevenue, formatCurrency),
      icon: DollarSign,
      color: 'bg-purple-55 bg-purple-50/10 text-purple-600',
      description: 'Attributed box-office turnover'
    },
    {
      title: 'Average ROAS',
      value: safeVal(kpis.roas, (v) => `${v}x`),
      icon: Percent,
      color: 'bg-teal-55 bg-teal-50/10 text-teal-600',
      description: 'Return on ad spend factor'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Banner alerts if in sandbox */}
      {isSandbox && (
        <div className="bg-blue-50/35 backdrop-blur-md border border-blue-200/45 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex gap-3">
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/10">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm md:text-base">Viewing Simulated Ad Account</h4>
              <p className="text-xs text-slate-500 mt-1">
                No active Facebook Ad Account is connected. Currently displaying rich sandboxed simulation data for testing. Connect your ad credentials inside the Link Accounts panel.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => handleRefresh()}
            className="text-xs font-semibold px-4 py-2 border border-slate-200 bg-white/85 hover:bg-white text-slate-700 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <RefreshCw size={12} /> Force Refresh Data
          </button>
        </div>
      )}

      {/* Control Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Facebook Marketing Control Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Realtime campaign summaries and visual conversion graphs mapped direct to Graph Marketing API v23+.
          </p>
        </div>
        {!isSandbox && (
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs font-bold self-start sm:self-center px-4 py-2.5 border border-white/50 hover:bg-white/90 bg-white/70 backdrop-blur-xs rounded-xl text-slate-750 shadow-xs transition active:scale-95"
          >
            <RefreshCw size={14} className="text-slate-500" />
            Refresh FB API
          </button>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div 
              key={index} 
              className="bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-2xl shadow-xs flex items-start gap-4 hover:shadow-md hover:border-slate-300/40 hover:bg-white/85 hover:-translate-y-0.5 transition duration-300"
            >
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <IconComponent size={20} />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{kpi.title}</span>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{kpi.value}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-normal">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spend trend */}
        <div className="bg-white/55 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">DAILY SPEND TREND</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50/70 px-2.0.5 py-1 rounded-lg">
              <TrendingUp size={12} />
              {formatCurrency(kpis.totalSpend)} Total
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.spendTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2189ed" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2189ed" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`$${val}`, 'Daily Spend']}
                />
                <Area type="monotone" dataKey="value" stroke="#2189ed" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reach trend */}
        <div className="bg-white/55 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IMPRESSIONS REACH SPEED</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50/70 px-2.0.5 py-1 rounded-lg">
              <Users size={12} />
              {formatNumber(kpis.totalReach)} Targeted
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.reachTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [formatNumber(val), 'Reach']}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#reachGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Sales trend */}
        <div className="bg-white/55 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CONVERSION TICKET SALES</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50/70 px-2.0.5 py-1 rounded-lg">
              <Ticket size={12} />
              {formatNumber(kpis.ticketSales)} sold
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.ticketSalesTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [formatNumber(val), 'Tickets Sold']}
                />
                <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Suggested Strategy section */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-550 text-blue-500" size={16} /> Happnex AI Marketing Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/70 backdrop-blur-xs border border-white/60 p-4 rounded-xl space-y-2 hover:border-blue-400/30 hover:bg-white/95 hover:shadow-xs transition duration-200">
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">High Delivery</span>
            <h5 className="font-bold text-slate-800 text-xs">Maximize EDM Campaign spend</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your "EDM Summer Oasis" campaign has hit an average ROAS of 10.06x over the last week. Consider shifting 15% budget away from Indie Showcase (pending) to boost early EDM tier sales.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xs border border-white/60 p-4 rounded-xl space-y-2 hover:border-blue-400/30 hover:bg-white/95 hover:shadow-xs transition duration-200">
            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">Custom Audience</span>
            <h5 className="font-bold text-slate-800 text-xs">Refresh Retargeting lists</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The Taylor Swift Custom Audience "Past Ticket Buyers" shows high CTR (6.95%). Generate a 2% lookalike audience to capture general country-pop lovers for the tour.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xs border border-white/60 p-4 rounded-xl space-y-2 hover:border-blue-400/30 hover:bg-white/95 hover:shadow-xs transition duration-200">
            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">Budget Warning</span>
            <h5 className="font-bold text-slate-800 text-xs">Comedy Showcase Draft status</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The "Laugh-Out-Loud Comedy" campaign is currently a **DRAFT** on Facebook but has been prepared with full assets. Connect or authorize the Ad Creative flow to start delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
