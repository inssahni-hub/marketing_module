import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import {
  Megaphone,
  Search,
  Filter,
  Send,
  X,
  Clock,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import SMSCampaignForm from './SMSCampaignForm.jsx';


export default function SMSCampaigns() {
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('id'); // prefilter particular campaign if redirected from home

  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notify, setNotify] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // In-place modal dialog controllers
  const [sendNowCampaignId, setSendNowCampaignId] = useState(null);
  const [cancelCampaignId, setCancelCampaignId] = useState(null);
  const [inspectCampaignId, setInspectCampaignId] = useState(highlightedId || null);
  const [inspectRecipients, setInspectRecipients] = useState([]);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectPage, setInspectPage] = useState(1);
  const [inspectTotalPages, setInspectTotalPages] = useState(1);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await smsApiService.getCampaigns({
        page,
        limit: 8,
        search,
        status: status
      });
      if (res.success) {
        setCampaigns(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to read database campaigns.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await smsApiService.getEvents();
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, status]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (inspectCampaignId) {
      fetchInspectRecipients(inspectCampaignId, inspectPage);
    }
  }, [inspectCampaignId, inspectPage]);

  const triggerNotification = (text, type = 'success') => {
    setNotify({ text, type });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  const handleSendNow = async (id) => {
    try {
      setActionLoading(id);
      const res = await smsApiService.sendCampaignNow(id);
      if (res.success) {
        triggerNotification('Campaign triggered! Broadcasting SMS texts...');
        setSendNowCampaignId(null);
        fetchCampaigns();
      } else {
        triggerNotification(res.error || 'Failed to trigger campaign broadcast.', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification(err.response?.data?.error || 'Credit verification failed or broker crash', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelCampaign = async (id) => {
    try {
      setActionLoading(id);
      const res = await smsApiService.cancelCampaign(id);
      if (res.success) {
        triggerNotification('Campaign scheduling cancelled successfully.', 'warning');
        setCancelCampaignId(null);
        fetchCampaigns();
      } else {
        triggerNotification(res.error || 'Failed to cancel', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to complete cancel operation.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setActionLoading(id);
      const res = await smsApiService.duplicateCampaign(id);
      if (res.success) {
        triggerNotification('Campaign cloned back as a Draft successfully.');
        fetchCampaigns();
      } else {
        triggerNotification(res.error || 'Failed to duplicate campaign', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to replicate campaign on database.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this campaign? Tracking analytics logs for this campaign will be lost permanently.')) {
      return;
    }
    try {
      setActionLoading(id);
      const res = await smsApiService.deleteCampaign(id);
      if (res.success) {
        triggerNotification('Campaign deleted successfully.', 'warning');
        fetchCampaigns();
      } else {
        triggerNotification(res.error || 'Failed to delete campaign', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to delete campaign from database.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const fetchInspectRecipients = async (id, targetPage) => {
    try {
      setInspectLoading(true);
      const res = await smsApiService.getCampaignRecipients(id, {
        page: targetPage,
        limit: 5
      });
      if (res.success) {
        setInspectRecipients(res.data || []);
        setInspectTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* Toast notifications */}
      {notify && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center space-x-2 animate-bounce ${notify.type === 'danger' ? 'bg-red-50 text-[#ef4444] border-red-100' :
          notify.type === 'warning' ? 'bg-amber-50 text-[#f59e0b] border-amber-100' :
            'bg-emerald-50 text-[#22c55e] border-emerald-100'
          }`}>
          <span>{notify.text}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">SMS Campaigns</h1>
          <p className="text-xs text-gray-500">Dispatch announcements, updates, and promos cleanly to your buyer lists.</p>
        </div>
        <a
          onClick={() => {
            setSelectedCampaign(null);
            setShowCampaignModal(true);
          }}
          className="bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 self-start shadow-sm"
        >
          <Megaphone className="h-4 w-4" />
          <span>Launch Campaign</span>
        </a>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search campaign name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-blue-100/80 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </form>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <Filter className="h-4 w-4" />
            <span>State:</span>
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-blue-100/80 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#2189ed] font-medium"
          >
            <option value="">All States</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Processing">Processing</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Columns / Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading ticketing campaigns...</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2189ed]/5 text-xs font-semibold text-gray-400 border-b border-blue-100/60 uppercase tracking-wider">
                  <th className="p-4 pl-6">Campaign Info</th>
                  <th className="p-4">Audience / Targets</th>
                  <th className="p-4">Status / Run Dates</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {campaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 pl-6 max-w-sm">
                      <div className="font-bold text-gray-800 tracking-tight">{camp.campaignName}</div>
                      <div className="text-xs text-gray-500 mt-1.5 font-mono line-clamp-2 leading-relaxed">
                        {camp.messageBody}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#eef6ff] text-[#2189ed] self-start">
                          {camp.audienceType}
                        </span>
                        {camp.audienceType === 'Event Buyers' && camp.targetEventId && (
                          <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[170px]">
                            Event: {camp.targetEventId.title}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400">
                          Targets: <span className="text-gray-700 font-extrabold">{camp.smsCount || 0} buyers</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        {/* Status badges */}
                        {camp.status === 'Sent' && (
                          <span className="bg-emerald-50 text-[#22c55e] text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start">Sent</span>
                        )}
                        {camp.status === 'Draft' && (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start">Draft</span>
                        )}
                        {camp.status === 'Scheduled' && (
                          <span className="bg-amber-50 text-[#f59e0b] text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start border border-amber-100 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Scheduled</span>
                          </span>
                        )}
                        {camp.status === 'Processing' && (
                          <span className="bg-blue-50 text-blue-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start animate-pulse flex items-center space-x-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Processing</span>
                          </span>
                        )}
                        {camp.status === 'Cancelled' && (
                          <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start">Cancelled</span>
                        )}
                        {camp.status === 'Failed' && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start">Failed</span>
                        )}

                        <span className="text-[10px] text-gray-400 font-semibold">
                          {camp.status === 'Scheduled' && camp.scheduledAt ? (
                            <span>Run: {new Date(camp.scheduledAt).toLocaleString()}</span>
                          ) : (
                            <span>Date: {new Date(camp.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">

                        {/* Send Trigger (Only Drafts/Failed) */}
                        {['Draft', 'Failed'].includes(camp.status) && (
                          <button
                            onClick={() => setSendNowCampaignId(camp._id)}
                            disabled={actionLoading === camp._id}
                            className="bg-[#2189ed]/10 text-[#2189ed] hover:bg-[#2189ed] hover:text-white transition p-1.5 rounded"
                            title="Send Campaign Now"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}

                        {/* Cancel trigger (Only Scheduled) */}
                        {camp.status === 'Scheduled' && (
                          <button
                            onClick={() => setCancelCampaignId(camp._id)}
                            disabled={actionLoading === camp._id}
                            className="bg-amber-50 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white transition p-1.5 rounded"
                            title="Cancel Scheduling"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        {/* Inspect status details (Sent/Processing/Failed) */}
                        {['Sent', 'Processing', 'Failed'].includes(camp.status) && (
                          <button
                            onClick={() => {
                              setInspectCampaignId(camp._id);
                              setInspectPage(1);
                            }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition text-xs font-bold px-2.5 py-1.5 rounded"
                            title="Inspect Recipients"
                          >
                            Recipients
                          </button>
                        )}

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(camp._id)}
                          disabled={actionLoading === camp._id}
                          className="bg-slate-50 text-gray-500 hover:bg-slate-100 transition p-1.5 rounded border border-slate-100"
                          title="Clone Campaign"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        {['Draft', 'Scheduled', 'Failed', 'Cancelled'].includes(camp.status) && (
                          <a
                            onClick={() => {
                              setSelectedCampaign(camp);
                              setShowCampaignModal(true);
                            }}
                            // href={`#/campaigns/edit/${camp._id}`}
                            className="bg-slate-50 text-[#2189ed] hover:bg-slate-100 transition p-1.5 rounded border border-slate-100 text-xs font-bold"
                            title="Edit Campaign"
                          >
                            Edit
                          </a>
                        )}

                        {/* Delete */}
                        {['Draft', 'Cancelled', 'Failed'].includes(camp.status) && (
                          <button
                            onClick={() => handleDeleteCampaign(camp._id)}
                            disabled={actionLoading === camp._id}
                            className="bg-red-50 text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition p-1.5 rounded"
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 border border-slate-100 shadow-sm text-center max-w-md mx-auto rounded-xl space-y-4">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-gray-700">No Campaigns Planned</h3>
            <p className="text-xs text-gray-500 mt-1">
              {search || status ? 'No filters match. Try clearing filters or searching for something else.' : 'No promotional or update campaigns drafted in this tenant.'}
            </p>
          </div>
          {(search || status) && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="mt-2 text-xs font-bold text-[#2189ed] underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}


      {/* MODALS INLINE DIALOGS */}

      {/* 1. Send Now Confirm dialog overlay */}
      {sendNowCampaignId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl border shadow-xl text-center space-y-4 animate-fade-in">
            <Send className="h-10 w-10 text-[#2189ed] mx-auto animate-bounce" />
            <div>
              <h3 className="font-bold text-gray-800 text-base">Broadcast Campaign?</h3>
              <p className="text-xs text-gray-500 mt-1 lines-normal">
                This will immediately deduct from your remaining credit quota and execute bulk dispatches to all target ticket holders in MongoDB.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSendNowCampaignId(null)}
                className="w-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSendNow(sendNowCampaignId)}
                className="w-1/2 p-2 bg-[#2189ed] hover:bg-[#1b74ca] rounded-xl text-xs font-bold text-white transition flex items-center justify-center space-x-1"
              >
                <span>Broadcast Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cancel Scheduled dialog overlay */}
      {cancelCampaignId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl border shadow-xl text-center space-y-4 animate-fade-in">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <div>
              <h3 className="font-bold text-gray-800 text-base">Cancel Scheduled Launch?</h3>
              <p className="text-xs text-gray-500 mt-1 lines-normal">
                Are you sure you want to stop this campaign from automatically dispatching at its scheduled date? It will be marked as Cancelled.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setCancelCampaignId(null)}
                className="w-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
              >
                Keep Active
              </button>
              <button
                onClick={() => handleCancelCampaign(cancelCampaignId)}
                className="w-1/2 p-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white transition"
              >
                De-schedule Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Recipients Inspector Sidebar Drawer Modal */}
      {inspectCampaignId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex justify-end z-50 transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in">

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-[#1f2937] text-base">Recipient Broadcast Logs</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Tracking delivery states via Twilio webhook reports.</p>
                </div>
                <button
                  onClick={() => setInspectCampaignId(null)}
                  className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-600 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {inspectLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-3">
                  <RefreshCw className="h-6 w-6 text-[#2189ed] animate-spin" />
                  <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Loading recipient tracker...</p>
                </div>
              ) : inspectRecipients.length > 0 ? (
                <div className="space-y-3">
                  {inspectRecipients.map((rec) => (
                    <div key={rec._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-xs text-gray-700 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-800">{rec.buyerId?.name || 'Prospective Buyer'}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{rec.phoneNumber}</span>
                      </div>

                      {/* Sub-tracking details */}
                      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-[10px]">
                        <div>
                          <p className="font-mono text-gray-400 truncate max-w-[170px]" title={rec.twilioMessageSid}>
                            SID: {rec.twilioMessageSid || 'Pending SID'}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            Sent: {rec.sentAt ? new Date(rec.sentAt).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>

                        {/* Tiny badge */}
                        <div>
                          {rec.status === 'Delivered' && (
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full">Delivered</span>
                          )}
                          {rec.status === 'Sent' && (
                            <span className="bg-blue-50 text-blue-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Dispatched</span>
                          )}
                          {rec.status === 'Queued' && (
                            <span className="bg-amber-50 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-full">Queued</span>
                          )}
                          {rec.status === 'Failed' && (
                            <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full" title={rec.errorMessage}>Failed</span>
                          )}
                          {rec.status === 'Pending' && (
                            <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">Pending</span>
                          )}
                        </div>
                      </div>

                      {rec.errorMessage && (
                        <p className="text-[9px] font-semibold text-red-600 bg-red-50 p-1.5 rounded">
                          Message: {rec.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <UserCheck className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No tracking data</p>
                  <p className="text-[10px] mt-1 text-gray-400 leading-normal">
                    Target buyers status logs populate immediately on active broadcast completion.
                  </p>
                </div>
              )}
            </div>

            {/* Inspect sidebar pagination */}
            {inspectTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 border-t border-slate-100 pt-4 bg-white z-10">
                <button
                  onClick={() => setInspectPage(p => Math.max(1, p - 1))}
                  disabled={inspectPage === 1}
                  className="p-1 bg-slate-50 border rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-bold text-gray-500">
                  Page {inspectPage} of {inspectTotalPages}
                </span>
                <button
                  onClick={() => setInspectPage(p => Math.min(inspectTotalPages, p + 1))}
                  disabled={inspectPage === inspectTotalPages}
                  className="p-1 bg-slate-50 border rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
      {showCampaignModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
        >
          <div
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedCampaign
                    ? 'Edit SMS Campaign'
                    : 'Create SMS Campaign'}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Configure audience, message template and delivery settings.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCampaignModal(false);
                  setSelectedCampaign(null);
                }}
                className="h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
              >
                ✕
              </button>

            </div>

            {/* Body */}
            <div className="max-h-[85vh] overflow-y-auto">

              <SMSCampaignForm
                campaignToEdit={selectedCampaign}
                onCancel={() => {
                  setShowCampaignModal(false);
                  setSelectedCampaign(null);
                }}
                onSuccess={() => {
                  setShowCampaignModal(false);
                  setSelectedCampaign(null);
                  fetchCampaigns();
                }}
              />

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
