import React from 'react';
import { 
  Search, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar, 
  Layers, 
  Sliders, 
  SlidersHorizontal,
  TrendingUp,
  SlidersHorizontal as FilterIcon,
  HelpCircle,
  FileMinus
} from 'lucide-react';

export default function FacebookCampaigns({
  campaigns,
  filteredCampaigns,
  paginatedCampaigns,
  totalPages,
  page,
  setPage,
  pageSize = 5,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  objectiveFilter,
  setObjectiveFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  viewCampaignDetails,
  handleRefresh,
  isLoading
}) {

  // Objectives filter listings
  const objectivesList = [
    { value: 'ALL', label: 'All Objectives' },
    { value: 'CONVERSIONS', label: 'Conversions / Ticket Purchases' },
    { value: 'LEAD_GENERATION', label: 'Lead Generation' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
    { value: 'OUTCOME_TRAFFIC', label: 'Traffic' }
  ];

  // Status Badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-150">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-150">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            PAUSED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-600 border border-slate-150">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            DRAFT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-500">
            {status}
          </span>
        );
    }
  };

  const getObjectiveLabel = (obj) => {
    return obj ? obj.replace('_', ' ') : 'N/A';
  };

  const formatBudget = (campaign) => {
    if (campaign.daily_budget) {
      return (
        <div>
          <span className="text-sm font-semibold text-slate-800">${parseFloat(campaign.daily_budget) / 100}</span>
          <span className="text-[10px] text-slate-400 block">Daily</span>
        </div>
      );
    }
    if (campaign.lifetime_budget) {
      return (
        <div>
          <span className="text-sm font-semibold text-slate-800">${parseFloat(campaign.lifetime_budget) / 100}</span>
          <span className="text-[10px] text-purple-500 block font-medium">Lifetime</span>
        </div>
      );
    }
    return <span className="text-xs text-slate-400 italic">Unbudgeted</span>;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort Indicator Helper
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Campaigns Inventory</h2>
          <p className="text-xs text-slate-450 text-slate-400 mt-1">
            Browse, search and deep filter connected promotional campaigns. Live delivery settings.
          </p>
        </div>
        <button 
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs font-bold px-4 py-2.5 border border-white/50 hover:bg-white/95 bg-white/70 backdrop-blur-xs rounded-xl text-slate-700 shadow-xs transition active:scale-95"
        >
          <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Grid Filter Bar container */}
      <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by name, ID or bidding goal..."
              className="w-full bg-white/50 hover:bg-white/80 focus:bg-white text-slate-800 text-xs pl-10 pr-4 py-3 border border-slate-200 focus:border-blue-550 focus:border-blue-500 rounded-xl outline-none transition"
            />
          </div>

          {/* Filter Status select */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[130px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/70 text-xs select-custom px-3 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium outline-none cursor-pointer hover:bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Delivery</option>
                <option value="PAUSED">Paused Ads</option>
                <option value="DRAFT">Draft Setup</option>
              </select>
            </div>

            {/* Filter Objective select */}
            <div className="min-w-[180px]">
              <select 
                value={objectiveFilter}
                onChange={(e) => setObjectiveFilter(e.target.value)}
                className="w-full bg-white/70 text-xs px-3 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium outline-none cursor-pointer hover:bg-white"
              >
                {objectivesList.map(obj => (
                  <option key={obj.value} value={obj.value}>{obj.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applied Filter Tags feedback */}
        {(search || statusFilter !== 'ALL' || objectiveFilter !== 'ALL') && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/40 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active filters:</span>
            {search && (
              <span className="text-[11px] font-semibold bg-white/80 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/50">
                Query: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="text-[11px] font-semibold bg-emerald-50/70 text-emerald-850 text-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('ALL')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {objectiveFilter !== 'ALL' && (
              <span className="text-[11px] font-semibold bg-blue-50/70 text-blue-850 text-blue-800 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-100">
                Objective: {objectiveFilter}
                <button onClick={() => setObjectiveFilter('ALL')} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setObjectiveFilter('ALL');
              }}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Campaigns list table */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className="p-6 flex items-center justify-between animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-150 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : paginatedCampaigns.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-white/60 border border-white/50 text-slate-400 rounded-full">
              <FileMinus size={24} />
            </div>
            <h4 className="font-semibold text-slate-700 text-sm">No campaign records match criteria</h4>
            <p className="text-xs text-slate-450 text-slate-405 max-w-sm">
              We couldn't retrieve any Facebook campaigns matching those custom filters. Expand your text search or toggle back default filters.
            </p>
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setObjectiveFilter('ALL');
              }}
              className="text-xs font-semibold px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 rounded-xl transition duration-150 shadow-xs active:scale-95"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-slate-200/50 text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-wider">
                  <th 
                    onClick={() => handleSort('name')} 
                    className="p-5 cursor-pointer hover:bg-white/40 hover:text-slate-700 transition"
                  >
                    Campaign Name {renderSortIndicator('name')}
                  </th>
                  <th 
                    onClick={() => handleSort('objective')} 
                    className="p-5 cursor-pointer hover:bg-white/40 hover:text-slate-700 transition"
                  >
                    Bidding Goal / Objective {renderSortIndicator('objective')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')} 
                    className="p-5 cursor-pointer hover:bg-white/40 hover:text-slate-700 transition"
                  >
                    Delivery Status {renderSortIndicator('status')}
                  </th>
                  <th className="p-5">
                    Budget Setting
                  </th>
                  <th className="p-5">
                    Created Date
                  </th>
                  <th className="p-5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 text-xs">
                {paginatedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/40 transition duration-150 group">
                    <td className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500/20 transition">
                          <Layers size={14} />
                        </div>
                        <div>
                          <p onClick={() => viewCampaignDetails(campaign.id)} className="font-bold text-slate-800 text-[13px] hover:text-blue-600 transition cursor-pointer">{campaign.name}</p>
                          <span className="text-[10px] text-slate-405 block mt-0.5 font-mono">ID: {campaign.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 uppercase tracking-wide font-medium text-slate-500 font-mono text-[10px]">
                      {getObjectiveLabel(campaign.objective)}
                    </td>
                    <td className="p-5">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="p-5">
                      {formatBudget(campaign)}
                    </td>
                    <td className="p-5 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(campaign.created_time)}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => viewCampaignDetails(campaign.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-tight border border-slate-200/80 hover:bg-white text-slate-700 bg-white/70 backdrop-blur-xs rounded-xl transition shadow-xs active:scale-95"
                      >
                        <Eye size={12} />
                        View Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer pagination */}
        {!isLoading && filteredCampaigns.length > 0 && (
          <div className="p-5 bg-white/30 border-t border-slate-200/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-slate-500 text-xs font-semibold">
              Showing <span className="text-slate-800">{(page - 1) * pageSize + 1}</span> to <span className="text-slate-800">{Math.min(page * pageSize, filteredCampaigns.length)}</span> of <span className="text-slate-800">{filteredCampaigns.length}</span> campaigns
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 hover:bg-white text-slate-600 bg-transparent disabled:opacity-40 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 font-semibold rounded-xl text-xs transition cursor-pointer ${
                        page === pNum 
                        ? 'bg-blue-500 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 hover:bg-white text-slate-600 bg-transparent disabled:opacity-40 rounded-xl transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
