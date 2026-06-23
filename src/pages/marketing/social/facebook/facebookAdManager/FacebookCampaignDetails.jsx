import React from 'react';
import { 
  ArrowLeft, 
  Layers, 
  FileText, 
  RefreshCw, 
  DollarSign, 
  Users, 
  MousePointerClick, 
  Percent,
  Gauge,
  Sliders,
  Image as ImageIcon,
  Activity,
  Award
} from 'lucide-react';
import FacebookAdSets from './FacebookAdSets';
import FacebookAds from './FacebookAds';
import FacebookInsights from './FacebookInsights';

export default function FacebookCampaignDetails({
  campaignDetail,
  adsets = [],
  adsetAds = {},
  insights,
  isLoading,
  currentTab,
  setCurrentTab,
  onBack,
  handleRefresh
}) {

  if (isLoading || !campaignDetail) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-[12px]"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-100 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-20 bg-slate-100 rounded-[16px]"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-[16px]"></div>
          ))}
        </div>
        <div className="h-72 bg-slate-100 rounded-[16px]"></div>
      </div>
    );
  }

  // Format budget strings nicely
  const formatBudget = (campaign) => {
    if (campaign.daily_budget) {
      return `$${(parseFloat(campaign.daily_budget) / 100).toFixed(2)}/day (Daily)`;
    }
    if (campaign.lifetime_budget) {
      return `$${(parseFloat(campaign.lifetime_budget) / 100).toFixed(2)} (Lifetime)`;
    }
    return 'N/A';
  };

  const getObjectiveLabel = (obj) => {
    return obj ? obj.replace(/_/g, ' ') : 'N/A';
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return new Intl.NumberFormat('en-US').format(val);
  };

  const formatPercentage = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    // If the CTR is already scaled out of 100 (e.g. 2.45 meaning 2.45%), display as-is.
    // If it's a raw ratio < 1 (e.g. 0.0245), scale by 100.
    const scaled = val < 1 ? val * 100 : val;
    return `${parseFloat(scaled).toFixed(2)}%`;
  };

  // Status indicators mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-full bg-amber-50 text-amber-700 text-[11px] border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            PAUSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-full bg-slate-50 text-slate-600 text-[11px] border border-slate-150">
            {status || 'DRAFT'}
          </span>
        );
    }
  };

  // Combine ads from all adsets for the Campaign Ads tab
  const getCampaignAllAds = () => {
    const allAds = [];
    adsets.forEach(adset => {
      const adsFromSet = adsetAds[adset.id] || [];
      adsFromSet.forEach(ad => {
        if (!allAds.some(item => item.id === ad.id)) {
          allAds.push(ad);
        }
      });
    });
    return allAds;
  };

  const campaignAllAds = getCampaignAllAds();

  // Metrics calculation fallbacks
  const spend = insights ? insights.spend : null;
  const reach = insights ? insights.reach : null;
  const impressions = insights ? (insights.impressions || (reach ? Math.round(reach * 1.5) : null)) : null;
  const clicks = insights ? insights.clicks : null;
  const ctr = insights ? (insights.ctr || (impressions && clicks ? (clicks / impressions) : null)) : null;
  const cpc = insights ? (insights.cpc || (clicks && spend ? (spend / clicks) : null)) : null;
  const cpm = insights ? (insights.cpm || (impressions && spend ? ((spend / impressions) * 1000) : null)) : null;

  return (
    <div className="space-y-6">
      
      {/* Return Back Header */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] rounded-[8px] shadow-sm transition active:scale-95 cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Campaigns
      </button>

      {/* Campaign Details Hero Header Panel */}
      <div className="bg-white p-6 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-[#2189ed] rounded-[16px]">
              <Layers size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">{campaignDetail.name}</h2>
                {getStatusBadge(campaignDetail.status)}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b] font-medium">
                <span className="font-mono">ID: {campaignDetail.id}</span>
                <span>•</span>
                <span className="uppercase font-semibold tracking-wider text-[10px] text-[#2189ed] bg-blue-50 px-2 py-0.5 rounded-[4px]">
                  Goal: {getObjectiveLabel(campaignDetail.objective)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch sm:self-end lg:self-center">
            <div className="text-right">
              <span className="text-[10px] text-[#64748b] block font-semibold uppercase tracking-wider">Campaign Budget Setting</span>
              <span className="text-sm font-semibold text-[#0f172a]">{formatBudget(campaignDetail)}</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-2.5 border border-[#e2e8f0] rounded-[8px] hover:bg-[#f8fafc] bg-white text-[#64748b] hover:text-[#0f172a] transition shadow-sm active:scale-95 cursor-pointer"
              title="Sync current Campaign"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Tab Controls layout */}
        <div className="border-t border-[#e2e8f0] pt-4 flex gap-1 overflow-x-auto select-none">
          {[
            { id: 'overview', label: 'Campaign Overview', icon: FileText },
            { id: 'adsets', label: `Ad Sets (${adsets.length})`, icon: Sliders },
            { id: 'ads', label: `Ad Creatives (${campaignAllAds.length})`, icon: ImageIcon },
            { id: 'insights', label: 'Cost Insights & ROI', icon: Activity }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-[8px] transition whitespace-nowrap cursor-pointer ${
                  isActive 
                  ? 'bg-[#2189ed] text-white shadow-sm' 
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] bg-transparent'
                }`}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs panels routing */}
      <div className="space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            
            {/* STAGE METRICS ROW (Spend, Reach, Impressions, Clicks, CTR, CPC, CPM) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              
              {/* Spend */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">Spend</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatCurrency(spend)}</p>
                <span className="text-[10px] text-[#64748b] block">Total cost accrued</span>
              </div>

              {/* Reach */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">Reach</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatNumber(reach)}</p>
                <span className="text-[10px] text-[#64748b] block">Unique accounts seen</span>
              </div>

              {/* Impressions */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">Impressions</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatNumber(impressions)}</p>
                <span className="text-[10px] text-[#64748b] block">Total times loaded</span>
              </div>

              {/* Clicks */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">Clicks</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatNumber(clicks)}</p>
                <span className="text-[10px] text-[#64748b] block">Link clicks triggered</span>
              </div>

              {/* CTR */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">CTR</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatPercentage(ctr)}</p>
                <span className="text-[10px] text-[#64748b] block">Click-through rate</span>
              </div>

              {/* CPC */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">CPC</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatCurrency(cpc)}</p>
                <span className="text-[10px] text-[#64748b] block">Cost per link click</span>
              </div>

              {/* CPM */}
              <div className="bg-white p-5 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-2">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider">CPM</div>
                <p className="text-xl font-semibold text-[#0f172a] tracking-tight">{formatCurrency(cpm)}</p>
                <span className="text-[10px] text-[#64748b] block">Cost per 1k views</span>
              </div>

            </div>

            {/* Sub-panels display side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Campaign settings summary */}
              <div className="bg-white p-6 rounded-[16px] border border-[#e2e8f0] shadow-sm space-y-4">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#64748b]">Campaign Specifications</h3>
                <div className="divide-y divide-slate-100 text-xs font-medium">
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#64748b]">Promotion Goal</span>
                    <span className="font-semibold text-[#0f172a] uppercase font-mono text-[10px]">{getObjectiveLabel(campaignDetail.objective)}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#64748b]">Delivery Registry Status</span>
                    <span className="font-semibold text-[#0f172a]">{campaignDetail.status}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#64748b]">Ad Account Registry</span>
                    <span className="font-mono text-[#0f172a] text-[11px]">act_{campaignDetail.id || 'Unknown'}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#64748b]">Natively Connected Sandbox API</span>
                    <span className="font-semibold text-[#64748b]">Facebook Graph API v23+</span>
                  </div>
                </div>
              </div>

              {/* Conversion Attribution Highlights */}
              <div className="bg-white p-6 rounded-[16px] border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#64748b] mb-4">Attributed Dynamic Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-4">
                    <div>
                      <span className="text-[9px] text-[#2189ed] font-semibold block uppercase tracking-wider">Ticket Sales Conversions</span>
                      <p className="text-lg font-semibold text-[#0f172a] mt-1">
                        {insights && insights.ticket_sales !== undefined && insights.ticket_sales !== null ? formatNumber(insights.ticket_sales) : 'N/A'} ticket purchases
                      </p>
                    </div>
                    <span className="text-[10px] bg-white text-[#2189ed] px-2 py-1 rounded font-semibold border border-[#e2e8f0] shadow-sm tracking-wider uppercase">BOX OFFICE</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-4">
                    <div>
                      <span className="text-[9px] text-emerald-600 font-semibold block uppercase tracking-wider">Aggregate Return Factor (ROAS)</span>
                      <p className="text-lg font-semibold text-emerald-700 mt-1">
                        {insights && insights.roas !== undefined && insights.roas !== null ? `${insights.roas}x` : 'N/A'} ROAS
                      </p>
                    </div>
                    <span className="text-[10px] bg-white text-emerald-600 px-2 py-1 rounded font-semibold border border-[#e2e8f0] shadow-sm tracking-wider uppercase">ROI</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: AD SETS */}
        {currentTab === 'adsets' && (
          <FacebookAdSets 
            adsets={adsets} 
            adsetAds={adsetAds} 
          />
        )}

        {/* TAB 3: ADS */}
        {currentTab === 'ads' && (
          <FacebookAds 
            ads={campaignAllAds} 
          />
        )}

        {/* TAB 4: INSIGHTS */}
        {currentTab === 'insights' && (
          <FacebookInsights 
            insights={insights} 
          />
        )}

      </div>
    </div>
  );
}
