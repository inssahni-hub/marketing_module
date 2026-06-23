import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingBag, 
  Percent, 
  DollarSign, 
  HelpCircle,
  Activity
} from 'lucide-react';

export default function FacebookInsights({ insights, isLoading }) {
  if (isLoading || !insights) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="h-28 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Build conversion funnel data
  const funnelData = [
    { name: '1. Impressions', value: insights.impressions, fill: '#6366f1' },
    { name: '2. Link Clicks', value: insights.clicks, fill: '#3b82f6' },
    { name: '3. Conversions', value: insights.conversions, fill: '#f43f5e' },
    { name: '4. Tickets Bought', value: insights.ticket_sales, fill: '#ec4899' }
  ];

  // Grid list of marketing indicators
  const subMetrics = [
    {
      title: 'CTR (Click-Through Rate)',
      value: `${(insights.ctr * 100).toFixed(2)}%`,
      desc: 'Link clicks divided by impressions',
      icon: Percent,
      color: 'text-indigo-500'
    },
    {
      title: 'CPC (Cost Per Click)',
      value: formatCurrency(insights.cpc),
      desc: 'Total ad spend divided by link clicks',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      title: 'CPM (Cost Per Mil)',
      value: formatCurrency(insights.cpm),
      desc: 'Average cost per 1,000 impressions',
      icon: Activity,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top micro metric summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subMetrics.map((sm, index) => {
          const IconComp = sm.icon;
          return (
            <div key={index} className="bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-xl shadow-2xs flex gap-4 items-center hover:bg-white/80 transition duration-150">
              <div className={`p-2 bg-slate-100/60 rounded-lg ${sm.color}`}>
                <IconComp size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sm.title}</span>
                <p className="text-sm font-extrabold text-slate-900 leading-tight">{sm.value}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">{sm.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel display & Conversions breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Visual funnel chart */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs lg:col-span-8 flex flex-col h-[340px]">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-450 text-slate-400 mb-4 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-indigo-555 text-indigo-505" /> Conversion Funnel Yield
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [formatNumber(val), 'Volume']}
                />
                <Bar dataKey="value" strokeWidth={1} radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROAS & Conversion summary */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yield summary</h4>
            
            <div className="p-4 bg-rose-50/25 rounded-xl space-y-1 border border-rose-200/40 backdrop-blur-xs">
              <span className="text-[9px] text-rose-555 text-rose-500 uppercase font-mono tracking-widest font-bold">ROAS MULTIPLIER</span>
              <p className="text-2xl font-black text-rose-600 tracking-tight">{insights.roas}x</p>
              <p className="text-[10px] text-slate-400 font-semibold">Return on capital invested</p>
            </div>

            <div className="p-4 bg-emerald-50/25 rounded-xl space-y-1 border border-emerald-200/40 backdrop-blur-xs">
              <span className="text-[9px] text-emerald-555 text-emerald-500 uppercase font-mono tracking-widest font-bold">SALES FLOW</span>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(insights.revenue || (insights.ticket_sales * 45))}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Box office revenue generated</p>
            </div>
          </div>

          <div className="bg-white/55 backdrop-blur-xs p-4 rounded-xl space-y-1 border border-white/60 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">Conversions Index Info</span>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              A higher CTR paired with solid ticket conversions means highly compelling copy. Maintain early-bird urgency cues!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
