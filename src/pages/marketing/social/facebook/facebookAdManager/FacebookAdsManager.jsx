import React, { useState } from 'react';
import { useFacebookManager } from '@/hooks/marketing/facebook/useFacebookManager.js';
import FacebookDashboard from '@/pages/marketing/social/facebook/facebookAdManager/FacebookDashboard';
import FacebookCampaigns from '@/pages/marketing/social/facebook/facebookAdManager/FacebookCampaigns';
import FacebookCampaignDetails from '@/pages/marketing/social/facebook/facebookAdManager/FacebookCampaignDetails';
import FacebookAdSets from '@/pages/marketing/social/facebook/facebookAdManager/FacebookAdSets';
import FacebookAds from '@/pages/marketing/social/facebook/facebookAdManager/FacebookAds';
import FacebookInsights from '@/pages/marketing/social/facebook/facebookAdManager/FacebookInsights';


import { 
  BarChart3, 
  Layers, 
  Sliders, 
  ImageIcon, 
  Link2, 
  LayoutDashboard, 
  Menu,
  X,
  AlertCircle
} from 'lucide-react';

export default function FacebookAdsManager() {
  const fb = useFacebookManager();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check network/connection states
  const isLinked = fb.connection && fb.connection.connected;
  const isLive = fb.connection && fb.connection.connected; // Since they configure real credentials

  // Sidebar link options
  const navItems = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Manage Campaigns', icon: Layers },
    { id: 'adsets', label: 'Targeting Ad Sets', icon: Sliders },
    { id: 'ads', label: 'Ad Creatives', icon: ImageIcon },
    { id: 'insights', label: 'Performance Insights', icon: BarChart3 },
    
  ];

  // Helper to aggregate all campaign adsets
  const getAllCampaignsAdSets = () => {
    if (fb.selectedCampaignId && fb.currentView === 'details') {
      return fb.selectedCampaignAdSets;
    }
    return fb.selectedCampaignAdSets || [];
  };

  // Helper to aggregate all ads
  const getAllCampaignsAds = () => {
    const aggregated = [];
    if (fb.selectedCampaignId && fb.currentView === 'details') {
      fb.selectedCampaignAdSets.forEach(as => {
        const ads = fb.adSetsAds[as.id] || [];
        ads.forEach(ad => aggregated.push(ad));
      });
      return aggregated;
    }
    
    // Otherwise loop all adsets in state
    Object.values(fb.adSetsAds).forEach(adsList => {
      if (Array.isArray(adsList)) {
        adsList.forEach(ad => aggregated.push(ad));
      }
    });
    return aggregated;
  };

  // Helper aggregate insights
  const getOverallInsights = () => {
    if (fb.selectedCampaignInsights && fb.currentView === 'details') {
      return fb.selectedCampaignInsights;
    }
    if (fb.dashboard && fb.dashboard.kpis) {
      const kpis = fb.dashboard.kpis;
      return {
        spend: kpis.totalSpend,
        reach: kpis.totalReach,
        impressions: kpis.totalReach ? Math.round(kpis.totalReach * 1.6) : null,
        clicks: kpis.totalClicks,
        ctr: (kpis.totalReach && kpis.totalClicks) ? (kpis.totalClicks / (kpis.totalReach * 1.6)) : null,
        cpc: (kpis.totalClicks && kpis.totalSpend) ? (kpis.totalSpend / kpis.totalClicks) : null,
        cpm: (kpis.totalReach && kpis.totalSpend) ? ((kpis.totalSpend / (kpis.totalReach * 1.6)) * 1000) : null,
        conversions: kpis.ticketSales,
        ticket_sales: kpis.ticketSales,
        revenue: kpis.totalRevenue,
        roas: kpis.roas
      };
    }
    return null;
  };

  const handleNavClick = (viewId) => {
    fb.setCurrentView(viewId);
    fb.setSelectedCampaignId(null);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex flex-col md:flex-row antialiased">
      
      {/* LEFT NAVIGATION SIDEBAR (Desktop - Frosted Glass Light) */}
      <aside className="w-72 bg-white text-[#0f172a] hidden md:flex flex-col border-r border-[#e2e8f0] shadow-sm shrink-0 select-none">
        
        {/* Brand logo container */}
        <div className="p-6 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#2189ed] flex items-center justify-center font-semibold text-white text-base shadow-md shadow-blue-500/10 tracking-wider">
            HX
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-base tracking-tight leading-none">Happnex</h1>
            <span className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider block mt-1">Campaign Manager</span>
          </div>
        </div>

        {/* Sidebar Nav anchors */}
        <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = fb.currentView === item.id && !fb.selectedCampaignId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs font-medium transition justify-start border border-transparent cursor-pointer ${
                  isActive 
                  ? 'bg-[#2189ed] text-white shadow-sm' 
                  : 'hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] bg-transparent'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

       
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white border-b border-[#e2e8f0] text-[#0f172a] p-4 flex items-center justify-between shadow-sm shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#2189ed] flex items-center justify-center font-semibold text-white text-xs shadow-sm">
            HX
          </div>
          <h1 className="font-semibold text-sm tracking-tight text-[#0f172a]">Happnex FB Console</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-[#f1f5f9] text-slate-600 rounded-[8px] transition cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE SLIDE-OUT MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/10 backdrop-blur-xs select-none">
          <div className="w-72 bg-white h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl border-r border-[#e2e8f0]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Navigation List</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#64748b] hover:text-[#0f172a] p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = fb.currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs font-medium transition justify-start border border-transparent cursor-pointer ${
                        isActive 
                        ? 'bg-[#2189ed] text-white shadow-sm' 
                        : 'hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] bg-transparent'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          
          </div>
        </div>
      )}

      {/* PRIMARY WORKSPACE */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top Notification bar monitor */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isLinked ? 'bg-emerald-500' : 'bg-[#64748b]'
            }`}></span>
            <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              {isLinked 
                ? 'Linked Ad Account Connection: Graph API v23+' 
                : 'No Facebook Ad Account Connected'}
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#64748b] font-medium">
           
            {isLinked && fb.connection && fb.connection.connection && (
              <span className="text-[#0f172a] bg-white border border-[#e2e8f0] px-2.5 py-1 rounded-[8px]">
                Ad Account: <strong>{fb.connection.connection.adAccountId}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Display generic error indicators */}
        {fb.error && (
          <div className="bg-rose-50 border border-rose-100 rounded-[16px] p-4 flex gap-3 text-rose-900 text-xs font-medium items-start shadow-sm">
            <AlertCircle size={16} className="text-rose-500 mt-0.5" />
            <div>
              <p className="font-semibold">Facebook Connection Attention Required</p>
              <p className="text-[11px] text-rose-700 font-normal mt-0.5">{fb.error}</p>
            </div>
          </div>
        )}

        {/* View Switch routing rendering */}
        {fb.currentView === 'dashboard' && (
          <FacebookDashboard 
            dashboard={fb.dashboard}
            connection={fb.connection}
            viewCampaignDetails={fb.viewCampaignDetails}
            handleRefresh={fb.handleRefresh}
            isLoading={fb.isLoading}
          />
        )}

        {fb.currentView === 'campaigns' && (
          <FacebookCampaigns 
            campaigns={fb.campaigns}
            filteredCampaigns={fb.filteredCampaigns}
            paginatedCampaigns={fb.paginatedCampaigns}
            totalPages={fb.totalPages}
            page={fb.page}
            setPage={fb.setPage}
            pageSize={fb.pageSize}
            search={fb.search}
            setSearch={fb.setSearch}
            statusFilter={fb.statusFilter}
            setStatusFilter={fb.setStatusFilter}
            objectiveFilter={fb.objectiveFilter}
            setObjectiveFilter={fb.setObjectiveFilter}
            sortField={fb.sortField}
            setSortField={fb.setSortField}
            sortOrder={fb.sortOrder}
            setSortOrder={fb.setSortOrder}
            viewCampaignDetails={fb.viewCampaignDetails}
            handleRefresh={fb.handleRefresh}
            isLoading={fb.isLoading}
          />
        )}

        {fb.currentView === 'details' && fb.selectedCampaignId && (
          <FacebookCampaignDetails 
            campaignDetail={fb.selectedCampaignDetail}
            adsets={fb.selectedCampaignAdSets}
            adsetAds={fb.adSetsAds}
            insights={fb.selectedCampaignInsights}
            isLoading={fb.isDetailLoading}
            currentTab={fb.detailTab}
            setCurrentTab={fb.setDetailTab}
            onBack={() => fb.setCurrentView('campaigns')}
            handleRefresh={fb.handleRefresh}
          />
        )}

        {fb.currentView === 'adsets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">Targeting Ad Sets</h2>
              <p className="text-xs text-[#64748b] mt-1">Review targeting optimization, geolocations, and budgets dynamically retrieved from Facebook Ad Sets API.</p>
            </div>
            <FacebookAdSets 
              adsets={getAllCampaignsAdSets()} 
              isLoading={fb.isLoading} 
              adsetAds={fb.adSetsAds}
            />
          </div>
        )}

        {fb.currentView === 'ads' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">Creative Ad Inventory</h2>
              <p className="text-xs text-[#64748b] mt-1">Review live text copies and visual banners synced from Facebook Ad Creatives API.</p>
            </div>
            <FacebookAds 
              ads={getAllCampaignsAds()} 
              isLoading={fb.isLoading} 
            />
          </div>
        )}

        {fb.currentView === 'insights' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">Performance Insights Summary</h2>
              <p className="text-xs text-[#64748b] mt-1">Examine total CPA, aggregate CTR, CPC ranges, and overall return values synced natively from Facebook Graph Reports.</p>
            </div>
            <FacebookInsights 
              insights={getOverallInsights()} 
              isLoading={fb.isLoading}
            />
          </div>
        )}

        {fb.currentView === 'connection' && ('')}

      </main>
    </div>
  );
}
