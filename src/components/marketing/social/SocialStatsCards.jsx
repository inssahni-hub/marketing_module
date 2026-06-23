import React from 'react';
import { Facebook, Instagram, Share2, DollarSign, Eye, Pointer, Goal, TrendingUp } from 'lucide-react';

export default function SocialStatsCards({ fbCampaigns, igCampaigns }) {
  // Aggregate Metrics
  const fbSpend = fbCampaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const fbImpressions = fbCampaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const fbClicks = fbCampaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const fbConversions = fbCampaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);

  const igSpend = igCampaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const igImpressions = igCampaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const igClicks = igCampaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const igConversions = igCampaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);

  const totalSpend = fbSpend + igSpend;
  const totalImpressions = fbImpressions + igImpressions;
  const totalClicks = fbClicks + igClicks;
  const totalConversions = fbConversions + igConversions;

  const avgCTR = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const avgCPA = totalConversions ? (totalSpend / totalConversions).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="social-stats-cards-grid">
      {/* Spend Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider mb-0.5">Social Ad Spend</span>
          <span className="text-xl font-bold text-slate-800 font-sans tracking-tight">${totalSpend.toFixed(2)}</span>
          <div className="flex gap-2.5 mt-1.5 text-[10px]">
            <span className="text-blue-600 flex items-center gap-0.5"><Facebook className="h-2.5 w-2.5" /> ${fbSpend.toFixed(0)}</span>
            <span className="text-pink-600 flex items-center gap-0.5"><Instagram className="h-2.5 w-2.5" /> ${igSpend.toFixed(0)}</span>
          </div>
        </div>
        <div className="bg-amber-50 text-amber-500 p-2.5 rounded-lg border border-amber-100 shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      {/* Impressions Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider mb-0.5">Impressions</span>
          <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">{totalImpressions.toLocaleString()}</span>
          <div className="flex gap-2.5 mt-1.5 text-[10px]">
            <span className="text-blue-600 flex items-center gap-0.5">FB {(fbImpressions/1000).toFixed(1)}k</span>
            <span className="text-pink-600 flex items-center gap-0.5">IG {(igImpressions/1000).toFixed(1)}k</span>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-500 p-2.5 rounded-lg border border-blue-100 shrink-0">
          <Eye className="h-5 w-5" />
        </div>
      </div>

      {/* Clicks & CTR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider mb-0.5">Ad Click Volume</span>
          <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">
            {totalClicks.toLocaleString()}
            <span className="text-[11px] text-slate-400 font-normal ml-1.5">{avgCTR}% CTR</span>
          </span>
          <div className="flex gap-2.5 mt-1.5 text-[10px]">
            <span className="text-blue-600 flex items-center gap-0.5">FB {fbClicks}</span>
            <span className="text-pink-600 flex items-center gap-0.5">IG {igClicks}</span>
          </div>
        </div>
        <div className="bg-purple-50 text-purple-500 p-2.5 rounded-lg border border-purple-100 shrink-0">
          <Pointer className="h-5 w-5" />
        </div>
      </div>

      {/* Conversions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider mb-0.5">Ticket Acquisitions</span>
          <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">
            {totalConversions.toLocaleString()}
            <span className="text-[11px] text-emerald-600 font-medium ml-1.5">${avgCPA} CPA</span>
          </span>
          <div className="flex gap-2.5 mt-1.5 text-[10px]">
            <span className="text-blue-600 flex items-center gap-0.5">FB {fbConversions}</span>
            <span className="text-pink-600 flex items-center gap-0.5 font-sans">IG {igConversions}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-lg border border-emerald-100 shrink-0">
          <Goal className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
