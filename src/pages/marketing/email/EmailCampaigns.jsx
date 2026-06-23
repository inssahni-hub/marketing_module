import React, { useState, useEffect } from 'react';
import { Plus, Search, Play, Calendar, AlertCircle, Trash2, Edit, Copy, Eye, ExternalLink, RefreshCw, XSquare } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailCampaigns({ onAddNewCampaign, onEditCampaign, onSelectAnalytics }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    fetchCampaigns();
  }, [search, status, page]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await emailApi.getCampaigns({
        search,
        status,
        page,
        limit: 8
      });
      if (res.success) {
        setCampaigns(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.error || 'Failed to query campaigns.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with full stack server.');
    } finally {
      setLoading(false);
    }
  };

  const executeSend = async (campaignId, campaignName) => {
    const buyerCountConfirm = window.confirm(`Initiating direct broadcast dispatch for campaign: "${campaignName}"?\n\nThis will instantly resolve and parse target buyers from MongoDB Mongoose repository and trigger live email delivery checks.`);
    if (!buyerCountConfirm) return;

    try {
      setLoading(true);
      const res = await emailApi.sendCampaignNow(campaignId);
      if (res.success) {
        alert(`Success! Dispatched campaign successfully.\n\nMetrics:\nTotal: ${res.stats.total}\nDelivered: ${res.stats.sent}\nFailed: ${res.stats.failed || 0}`);
        fetchCampaigns();
      } else {
        alert(res.error || 'Outbound quota or verification failed.');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error dispatching campaign items immediately.');
    } finally {
      setLoading(false);
    }
  };

  const executeCancel = async (id, name) => {
    if (!window.confirm(`Stop processing scheduled time for event: "${name}"? Status will revert back to Draft.`)) return;
    try {
      setLoading(true);
      const res = await emailApi.cancelCampaign(id);
      if (res.success) {
        alert('Scheduled delivery cancelled successfully.');
        fetchCampaigns();
      } else {
        alert(res.error || 'Failed to cancel scheduled queue.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDuplicate = async (id) => {
    try {
      setLoading(true);
      const res = await emailApi.duplicateCampaign(id);
      if (res.success) {
        alert('Campaign cloned into Draft status.');
        fetchCampaigns();
      } else {
        alert(res.error || 'Could not copy campaigns card.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (id, name) => {
    if (!window.confirm(`Delete campaign: "${name}" entirely? Logs corresponding to target lists, opens, and bounces will remain intact.`)) return;
    try {
      setLoading(true);
      const res = await emailApi.deleteCampaign(id);
      if (res.success) {
        setCampaigns(campaigns.filter(c => c._id !== id));
      } else {
        alert(res.error || 'Delete operation rejected.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Ribbon Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Email Marketing Campaigns</h2>
          <p className="text-xs text-slate-400 mt-1">Deploy, monitor, and copy single or multi-event newsletters, feedback circles, and ticket retargeting.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCampaigns}
            className="p-2.5 text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={onAddNewCampaign}
            className="px-4 py-2.5 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      {/* Query Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input bar */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search campaigns by name or email subjects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
          />
        </div>

        {/* Status code filtering */}
        <div>
          <select 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Processing">Processing</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* Primary listings block */}
      {loading && campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2189ed]"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium whitespace-nowrap">Gathering campaigns queue...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-16 text-center border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center">
          <div className="p-4 bg-[#eef6ff] text-[#2189ed] rounded-full mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No Marketing Campaigns Active</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Compose newsletters, define targeted buyer pipelines, and schedule multi-tenant deliveries.</p>
          <button 
            onClick={onAddNewCampaign}
            className="mt-6 px-4 py-2.5 bg-[#eef6ff] hover:bg-[#2189ed]/15 text-[#2189ed] text-xs font-bold rounded-lg transition"
          >
            Compose New Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div key={camp._id} className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition">
              
              <div>
                {/* State Label row */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                    camp.status === 'Sent' ? 'bg-green-100 text-green-800' :
                    camp.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    camp.status === 'Processing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    camp.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {camp.status?.toUpperCase()}
                  </span>
                  
                  {/* Quota tag if set */}
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Audience: <strong className="text-slate-700">{camp.audienceType}</strong>
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-base line-clamp-1">{camp.campaignName}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">Subject: "{camp.subject}"</p>

                {camp.scheduledAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Scheduled on: {new Date(camp.scheduledAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action items container */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Updated: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(camp.updatedAt))}
                </span>
                
                <div className="flex items-center gap-1.5">
                  
                  {/* Immediate send trigger */}
                  {camp.status === 'Draft' && (
                    <button 
                      onClick={() => executeSend(camp._id, camp.campaignName)}
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-xs transition flex items-center gap-1"
                      title="Send Immediate"
                    >
                      <Play className="w-3.5 h-3.5" /> Dispatch
                    </button>
                  )}

                  {/* Cancel Schedule trigger */}
                  {camp.status === 'Scheduled' && (
                    <button 
                      onClick={() => executeCancel(camp._id, camp.campaignName)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition flex items-center gap-1"
                      title="Repurpose back to Draft"
                    >
                      <XSquare className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}

                  {/* Modify content card */}
                  {(camp.status === 'Draft' || camp.status === 'Scheduled') && (
                    <button 
                      onClick={() => onEditCampaign(camp)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                      title="Edit Campaign metadata"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {/* Analytics specific report */}
                  {camp.status === 'Sent' && (
                    <button 
                      onClick={() => onSelectAnalytics(camp._id)}
                      className="px-3 py-1 bg-[#eef6ff] hover:bg-[#2189ed]/10 text-[#2189ed] font-bold rounded-lg text-xs transition flex items-center gap-1"
                      title="View Detailed Logs metrics"
                    >
                      Analytics <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Duplicate action button */}
                  <button 
                    onClick={() => executeDuplicate(camp._id)}
                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#2189ed] rounded-lg transition"
                    title="Duplicate setup config"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Remove Campaign record */}
                  {camp.status !== 'Processing' && (
                    <button 
                      onClick={() => executeDelete(camp._id, camp.campaignName)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                      title="Delete Campaign node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pages switcher metrics */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold">Page {page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold rounded-lg transition"
            >
              Previous
            </button>
            <button 
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
