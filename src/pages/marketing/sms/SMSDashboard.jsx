import React, { useState, useEffect } from 'react';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import { 
  Send, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  PlusCircle, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

export default function SMSDashboard({ onUpdateCredits }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await smsApiService.getDashboardData();
      if (res.success) {
        setData(res.data);
        if (onUpdateCredits && res.data.quota) {
          onUpdateCredits(res.data.quota);
        }
      } else {
        setError(res.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to establish backend API network communication.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Add event listener for tenant toggles
    window.addEventListener('active_tenant_changed', fetchDashboardData);
    return () => {
      window.removeEventListener('active_tenant_changed', fetchDashboardData);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="h-10 w-10 text-[#2189ed] animate-spin" />
        <p className="text-gray-500 font-medium">Aggregating multi-tenant statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#eef6ff] border border-blue-200 text-gray-800 p-6 rounded-xl flex items-center space-x-4 max-w-2xl mx-auto my-10">
        <AlertCircle className="h-8 w-8 text-[#2189ed] flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-lg text-[#1f2937]">Network Sync Exception</h3>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { quota, analytics, campaignStatuses, recentCampaigns, performanceTrend } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#2189ed] to-[#1b74ca] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SMS Marketing Control Center</h1>
          <p className="text-blue-100 text-sm mt-1">
            Reconnecting sub-tenants directly with ticketholders. Active Plan: <span className="font-semibold">{quota?.activePlan} Plan</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="#/campaigns/new"
            className="bg-white hover:bg-slate-50 text-[#2189ed] font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Launch Campaign</span>
          </a>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#eef6ff] rounded-lg">
            <Send className="h-6 w-6 text-[#2189ed]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total SMS Sent</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{analytics?.totalSent || 0}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivered (Rate)</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {analytics?.delivered || 0} <span className="text-sm font-semibold text-[#22c55e]">({analytics?.deliveryRate}%)</span>
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-50 rounded-lg">
            <XCircle className="h-6 w-6 text-[#ef4444]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Failed (Rate)</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {analytics?.failed || 0} <span className="text-sm font-semibold text-red-500">({analytics?.failureRate}%)</span>
            </h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-[#f59e0b]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining Credits</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{quota?.smsRemaining || 0}</h3>
            <div className="w-full bg-blue-50 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#2189ed] h-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, ((quota?.smsRemaining || 0) / (quota?.smsLimit || 1)) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Segment: Graphs vs Campaign Status Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign Deliveries over time */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-[#2189ed]" />
                <span>Recent Campaigns Performance</span>
              </h3>
              <p className="text-xs text-gray-500">Breakdown of dispatched volume, hits and errors.</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Refresh Stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {performanceTrend && performanceTrend.length > 0 ? (
            <div className="space-y-4">
              {performanceTrend.map((trend, idx) => {
                const total = trend.sent || 1;
                const delPct = Math.round((trend.delivered / total) * 100);
                const failPct = Math.round((trend.failed / total) * 100);
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-gray-700">
                      <span className="truncate max-w-[200px] font-semibold">{trend.campaignName}</span>
                      <span className="text-gray-500">
                        {trend.sent} sent • <span className="text-[#22c55e]">{trend.delivered} del</span> • <span className="text-red-500">{trend.failed} fail</span>
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                      <div className="bg-[#22c55e] h-full" style={{ width: `${delPct}%` }} title={`Delivered: ${delPct}%`}></div>
                      <div className="bg-red-500 h-full" style={{ width: `${failPct}%` }} title={`Failed: ${failPct}%`}></div>
                      <div className="bg-slate-300 h-full flex-1" title="Pending Status"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-500">No campaigns sent yet</p>
              <p className="text-xs text-gray-400 mt-1">Dispatched campaigns will draw interactive progress analytics here.</p>
            </div>
          )}
        </div>

        {/* Campaign Status break downs */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-[#2189ed]" />
              <span>Campaign States</span>
            </h3>
            <p className="text-xs text-gray-500 mb-6">Historical records in current tenant pipeline.</p>
            
            <div className="space-y-3">
              {/* Drafts */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-blue-100/50 pb-2.5">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span>Draft</span>
                </span>
                <span className="font-bold text-gray-800">{campaignStatuses?.draft || 0}</span>
              </div>
              
              {/* Scheduled */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-blue-100/50 pb-2.5">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <span>Scheduled</span>
                </span>
                <span className="font-bold text-gray-800">{campaignStatuses?.scheduled || 0}</span>
              </div>

              {/* Processing */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-blue-100/50 pb-2.5">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span>Processing</span>
                </span>
                <span className="font-bold text-gray-800">{campaignStatuses?.processing || 0}</span>
              </div>

              {/* Sent */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-blue-100/50 pb-2.5">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span>
                  <span>Sent</span>
                </span>
                <span className="font-bold text-gray-800">{campaignStatuses?.sent || 0}</span>
              </div>

              {/* Failed */}
              <div className="flex justify-between items-center text-xs text-gray-600 pb-1">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                  <span>Failed</span>
                </span>
                <span className="font-bold text-gray-800">{campaignStatuses?.failed || 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Total Campaigns Drafted:</span>
            <span className="font-extrabold text-[#2189ed] text-sm">{analytics?.totalCampaigns || 0}</span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Segment: Recent Campaigns Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Recent Marketing Runs</h3>
          <a 
            href="#/campaigns" 
            className="text-xs font-bold text-[#2189ed] hover:text-[#1b74ca] transition flex items-center space-x-1"
          >
            <span>View All Campaigns</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {recentCampaigns && recentCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-400 border-b border-blue-50 uppercase tracking-wider">
                  <th className="p-4 pl-6">Campaign Name</th>
                  <th className="p-4">Audience Class</th>
                  <th className="p-4">Recipient Target</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentCampaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-800">{camp.campaignName}</td>
                    <td className="p-4">
                      <span className="bg-[#eef6ff] text-[#2189ed] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {camp.audienceType}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-600">
                      {camp.smsCount || 0} Buyers
                    </td>
                    <td className="p-4">
                      {camp.status === 'Sent' && (
                        <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">Sent</span>
                      )}
                      {camp.status === 'Draft' && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">Draft</span>
                      )}
                      {camp.status === 'Scheduled' && (
                        <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">Scheduled</span>
                      )}
                      {camp.status === 'Processing' && (
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">Processing</span>
                      )}
                      {camp.status === 'Cancelled' && (
                        <span className="bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">Cancelled</span>
                      )}
                      {camp.status === 'Failed' && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">Failed</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs font-semibold">
                      {new Date(camp.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <a
                        href={`#/campaigns?id=${camp._id}`}
                        className="text-xs font-bold text-[#2189ed] hover:text-[#1b74ca] transition"
                      >
                        Inspect Runs
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No campaigns drafted</p>
            <p className="text-xs">Triggered marketing records will organize in this listing pool.</p>
          </div>
        )}
      </div>
    </div>
  );
}
