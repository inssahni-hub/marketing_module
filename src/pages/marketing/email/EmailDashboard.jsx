import React, { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, Clock, AlertTriangle, AlertCircle, BarChart3, TrendingUp, Users, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailDashboard({ onViewChange, onEditCampaign, onSelectCampaignAnalytics, selectedCampaignTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOrganizer, setActiveOrganizer] = useState(null);

  const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;

  useEffect(() => {
    fetchStats();
    setActiveOrganizer(emailApi.getCurrentOrganizer());
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      // Auto-authenticate default organizer if none is logged in
      let profile = emailApi.getCurrentOrganizer();
      
      const res = await emailApi.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.error || 'Failed to retrieve stats.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred connecting to the API server.');
    } finally {
      setLoading(false);
    }
  };

  const executeSendCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to send this campaign immediately to all resolved ticket buyers?')) return;
    try {
      setLoading(true);
      const res = await emailApi.sendCampaignNow(campaignId);
      if (res.success) {
        alert(`Campaign Sent Successfully! ${res.stats.sent} emails delivered.`);
        fetchStats();
      } else {
        alert(res.error || 'Failed to dispatch campaigns.');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error executing direct campaign dispatch.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2189ed]"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Retrieving marketing data models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-lg text-red-900">Module Initialization Failed</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { campaignsCount, emailMetrics, usagePlan, recentCampaigns, monthlyTrends, platformSummary } = stats || {
    campaignsCount: { total: 0, draft: 0, scheduled: 0, sent: 0, failed: 0 },
    emailMetrics: { totalSent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0, openRate: 0, clickRate: 0 },
    usagePlan: { emailsSent: 0, emailsRemaining: 5000, limitTotal: 5000 },
    recentCampaigns: [],
    monthlyTrends: [],
    platformSummary: { totalEvents: 0, totalBuyers: 0 }
  };

  const usagePercent = Math.min(100, Math.round((usagePlan.emailsSent / (usagePlan.limitTotal || 5000)) * 100));

  return (
    <div className="space-y-6">
      
      {/* Upper Alerts & Plan Banners */}
      {usagePercent >= 90 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Approaching Multi-Tenant Plan Limit</p>
              <p className="text-xs text-amber-600 font-medium">You have consumed {usagePercent}% of your active monthly outbound credits.</p>
            </div>
          </div>
          <button 
            onClick={() => onViewChange('plans')}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Top row metric aggregators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Campaigns</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-800">{campaignsCount.total}</span>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              {campaignsCount.sent} Sent
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> {campaignsCount.scheduled} Scheduled</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-gray-400" /> {campaignsCount.draft} Drafts</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Emails Dispatched</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-800">{emailMetrics.totalSent.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400">Total volume</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Delivered: {emailMetrics.delivered.toLocaleString()}</span>
            <span className="text-red-500">Bounced: {emailMetrics.bounced}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Open Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-800">{emailMetrics.openRate}%</span>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Healthy</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full" style={{ width: `${emailMetrics.openRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Click Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-800">{emailMetrics.clickRate}%</span>
            <span className="text-xs font-medium text-slate-400">CTR Tracker</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#2189ed] h-full rounded-full" style={{ width: `${emailMetrics.clickRate * 2.5}%` }}></div>
          </div>
        </div>

      </div>

      {/* Middle Section: Trends & Plan Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simplified campaign trends node */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Campaign Delivery Trends</h3>
              <p className="text-xs text-slate-400">Progressive metric reporting timelines</p>
            </div>
            <span className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-medium text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-[#2189ed]" /> Last 6 periods
            </span>
          </div>

          {/* Graphical nodes */}
          <div className="flex-1 flex items-end gap-3 min-h-[160px] pt-4 border-b border-dashed border-slate-100">
            {monthlyTrends.map((point, index) => {
              const maxVal = Math.max(...monthlyTrends.map(t => t.sent)) || 2000;
              const barHeight = Math.round((point.sent / maxVal) * 100);
              const opHeight = Math.round((point.opened / maxVal) * 100);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md transition pointer-events-none z-10 whitespace-nowrap">
                    Sent: {point.sent.toLocaleString()}<br />
                    Opened: {point.opened.toLocaleString()}
                  </div>

                  {/* Dual layered bar visuals */}
                  <div className="w-full relative flex flex-col justify-end items-center h-full max-w-10">
                    <div className="w-full bg-[#2189ed] rounded-t min-h-[4px] relative" style={{ height: `${barHeight}%` }}>
                      <div className="w-full bg-blue-300 absolute bottom-0 rounded-t" style={{ height: `${opHeight}%` }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-2">{point.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#2189ed] rounded-sm"></span> Volume Dispatched</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-300 rounded-sm"></span> Opened Responses</span>
          </div>
        </div>

        {/* Current Plan Overview Circle */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Plan Usage Details</h3>
            <p className="text-xs text-slate-400">Multi-tenant quota monitoring</p>
          </div>

          <div className="my-6">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-semibold uppercase">{activeOrganizer?.plan || 'Basic'} Subscription</span>
              <span className="font-bold text-gray-800">{usagePlan.emailsSent?.toLocaleString()} / {usagePlan.limitTotal?.toLocaleString()} sent</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercent > 95 ? 'bg-red-500' : (usagePercent > 75 ? 'bg-amber-400' : 'bg-[#2189ed]')}`} 
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-2">
              Remaining sending credits: <span className="text-[#2189ed] font-bold">{usagePlan.emailsRemaining?.toLocaleString()}</span> emails.
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            <button 
              onClick={() => onViewChange('plans')}
              className="w-full py-2.5 bg-[#eef6ff] text-[#2189ed] hover:bg-[#2189ed]/10 text-xs font-bold rounded-lg transition text-center"
            >
              Subscription Tier Pricing
            </button>
            <div className="text-[10px] text-center text-slate-400 font-medium">
              Billing period cycles automatically monthly
            </div>
          </div>
        </div>

      </div>

      {/* Recipient Overview & Seeding stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Micro Event Connector summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#eef6ff] text-[#2189ed] rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Events</p>
              <h4 className="text-xl font-bold text-slate-800">{platformSummary.totalEvents} campaigns hosts</h4>
            </div>
          </div>
          <button onClick={() => onViewChange('audience')} className="p-1 text-slate-400 hover:text-[#2189ed] transition">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Total Target Recipients */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved Ticket Buyers</p>
              <h4 className="text-xl font-bold text-slate-800">{platformSummary.totalBuyers} registered</h4>
            </div>
          </div>
          <button onClick={() => onViewChange('audience')} className="p-1 text-slate-400 hover:text-green-600 transition">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* SendGrid live connector state */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outbound Service SDK</p>
              <h4 className="text-md font-bold text-slate-800">
                {SENDGRID_API_KEY ? 'Live SendGrid Key Active' : 'Simulation Sandbox'}
              </h4>
            </div>
          </div>
          <button onClick={() => onViewChange('settings')} className="p-1 text-slate-400 hover:text-purple-600 transition">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Recent Outbound Campaigns */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/25">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recent Outbound Campaigns</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status updates and delivery logs</p>
          </div>
          <button 
            onClick={() => onViewChange('campaigns')}
            className="text-xs font-bold text-[#2189ed] hover:underline"
          >
            Review All Campaigns
          </button>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No Campaigns initiated yet. Click <span className="font-semibold text-[#2189ed]">Create Campaign</span> above to draft your first dispatch!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3">Campaign Specifications</th>
                  <th className="px-6 py-3 text-center">Audience Selection</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Delivered</th>
                  <th className="px-6 py-3 text-center">Open Rate</th>
                  <th className="px-6 py-3 text-center">Click Rate</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCampaigns.map((camp) => {
                  const hasStats = camp.stats && camp.stats.totalSent > 0;
                  const openRatio = hasStats ? Math.round((camp.stats.opened / camp.stats.totalSent) * 100) : 0;
                  const clickRatio = hasStats ? Math.round((camp.stats.clicked / camp.stats.totalSent) * 100) : 0;

                  return (
                    <tr key={camp._id} className="text-xs text-slate-600 hover:bg-slate-50/50 transition">
                      
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-800 text-sm">{camp.campaignName}</p>
                        <p className="text-slate-400 text-[11px] font-medium truncate max-w-xs">{camp.subject}</p>
                      </td>

                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold text-[10px]">
                          {camp.audienceType}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          camp.status === 'Sent' ? 'bg-green-100 text-green-800' :
                          camp.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          camp.status === 'Processing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          camp.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {camp.status?.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-center font-semibold text-slate-800">
                        {camp.status === 'Sent' ? `${camp.stats?.delivered || 0} / ${camp.stats?.totalSent || 0}` : '-'}
                      </td>

                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {camp.status === 'Sent' ? `${openRatio}%` : '-'}
                      </td>

                      <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                        {camp.status === 'Sent' ? `${clickRatio}%` : '-'}
                      </td>

                      <td className="px-6 py-3.5 text-right space-x-1 whitespace-nowrap">
                        {camp.status === 'Draft' && (
                          <button 
                            onClick={() => executeSendCampaign(camp._id)}
                            className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition"
                            title="Send Immediately"
                          >
                            <Play className="w-4 h-4 inline" /> Send
                          </button>
                        )}
                        {camp.status === 'Draft' && (
                          <button 
                            onClick={() => onEditCampaign(camp)}
                            className="px-2.5 py-1 text-[#2189ed] hover:underline font-bold text-[11px]"
                          >
                            Edit
                          </button>
                        )}
                        {camp.status === 'Sent' && (
                          <button 
                            onClick={() => onSelectCampaignAnalytics(camp._id)}
                            className="p-1 px-2.5 bg-[#eef6ff] hover:bg-[#2189ed]/10 text-[#2189ed] font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                          >
                            Report <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
