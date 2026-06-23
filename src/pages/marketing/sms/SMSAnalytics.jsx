import React, { useState, useEffect } from 'react';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XSquare, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export default function SMSAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  // Recipient Logs pagination / filters
  const [logStatus, setLogStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchPhone, setSearchPhone] = useState('');

  const fetchGlobalAnalytics = async () => {
    try {
      const res = await smsApiService.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCampaignDropdown = async () => {
    try {
      const res = await smsApiService.getCampaigns({ limit: 100 });
      if (res.success) {
        // filter campaigns that have been processed to show relevant logs
        setCampaigns(res.data.filter(c => ['Sent', 'Processing', 'Failed'].includes(c.status)));
        if (res.data.length > 0 && !selectedCampaignId) {
          // select first sent campaign if available
          const firstSent = res.data.find(c => ['Sent', 'Processing'].includes(c.status));
          if (firstSent) {
            setSelectedCampaignId(firstSent._id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecipientLogs = async () => {
    if (!selectedCampaignId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await smsApiService.getCampaignRecipients(selectedCampaignId, {
        page,
        limit: 10,
        status: logStatus
      });
      if (res.success) {
        // we can filter Client side for phone search if requested
        let filtered = res.data;
        if (searchPhone) {
          filtered = res.data.filter(rec => rec.phoneNumber.includes(searchPhone));
        }
        setLogs(filtered);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAnalytics();
    fetchCampaignDropdown();
  }, []);

  useEffect(() => {
    fetchRecipientLogs();
  }, [selectedCampaignId, page, logStatus, searchPhone]);

  const handleRefresh = () => {
    fetchGlobalAnalytics();
    fetchRecipientLogs();
  };

  const { analytics, performanceTrend } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">SMS Analytics & Tracking</h1>
          <p className="text-xs text-gray-500">Global audit logs and Twilio delivery state callback metrics.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 bg-white border border-blue-100 hover:bg-blue-50/50 rounded-xl transition text-gray-500 text-xs font-bold flex items-center space-x-1 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Analytics Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery Rate</span>
            <h3 className="text-2xl font-extrabold text-gray-800">{analytics?.deliveryRate || 0}%</h3>
            <p className="text-[10px] text-gray-400 font-medium">Out of total campaign messages dispatch.</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#22c55e]">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Failure Rate</span>
            <h3 className="text-2xl font-extrabold text-[#ef4444]">{analytics?.failureRate || 0}%</h3>
            <p className="text-[10px] text-gray-400 font-medium">Bounces due to invalid numbers.</p>
          </div>
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-[#ef4444]">
            <XSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sent Log</span>
            <h3 className="text-2xl font-extrabold text-gray-800">{analytics?.totalSent || 0} SMS</h3>
            <p className="text-[10px] text-gray-400 font-medium">All-time multi-tenant messages sent.</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-[#2189ed]">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Costs</span>
            <h3 className="text-2xl font-extrabold text-gray-800">${analytics?.balanceUSD || '0.000'}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Based on Twilio standard rate of $0.0075.</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-[#f59e0b]">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main console segmentation */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
        
        {/* Controls Sub-panel */}
        <div className="p-5 border-b border-blue-50 bg-blue-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700 block sm:inline mr-2">Audit Campaign:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  setPage(1);
                  setLogs([]);
                }}
                className="px-3 py-1.5 border border-blue-100 rounded-xl text-xs bg-white text-blue-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#2189ed]"
              >
                <option value="">-- Choose Campaign to Inspect --</option>
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.campaignName} ({c.smsCount} Sent)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={logStatus}
                onChange={(e) => {
                  setLogStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-blue-100 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2189ed]"
                disabled={!selectedCampaignId}
              >
                <option value="">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Sent">Sent (Dispatched)</option>
                <option value="Queued">Queued</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <input 
              type="text"
              placeholder="Search phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-blue-100 rounded-xl text-xs bg-white focus:outline-none"
              disabled={!selectedCampaignId}
            />
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Dynamic logs display */}
        {!selectedCampaignId ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
            <BarChart3 className="h-12 w-12 text-slate-300" />
            <div>
              <h3 className="font-bold text-gray-600">Select Campaign to inspect logs</h3>
              <p className="text-xs text-gray-500 mt-1 lines-normal">
                Choose an active or completed marketing SMS run from the dropdown above to view transactional logs.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Scanning recipient trackers...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2189ed]/5 text-xs font-semibold text-gray-400 border-b border-blue-100/60 uppercase tracking-wider">
                  <th className="p-4 pl-6">Buyer Name</th>
                  <th className="p-4">Contact Out</th>
                  <th className="p-4 font-mono">Twilio Message SID / Logs</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 pr-6">Activity Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-gray-800">{rec.buyerId?.name || 'Prospect Holder'}</div>
                      <div className="text-[10px] text-gray-400 font-bold flex items-center space-x-1 mt-0.5">
                        {rec.buyerId?.isVIP && (
                          <span className="bg-purple-50 text-purple-600 px-1.5 py-0.2 rounded-full text-[9px] uppercase tracking-wider">VIP Buyer</span>
                        )}
                        <span>{rec.buyerId?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-gray-600">{rec.phoneNumber}</td>
                    <td className="p-4 font-mono text-xs max-w-xs">
                      <div className="truncate text-gray-400" title={rec.twilioMessageSid}>
                        {rec.twilioMessageSid || 'Pending SMS SID'}
                      </div>
                      {rec.errorMessage && (
                        <p className="text-[10px] text-[#ef4444] font-semibold bg-red-50 p-1 rounded mt-1 border border-red-100">
                          {rec.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {rec.status === 'Delivered' && (
                        <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">Delivered</span>
                      )}
                      {rec.status === 'Sent' && (
                        <span className="bg-blue-50 text-blue-500 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">Dispatched</span>
                      )}
                      {rec.status === 'Queued' && (
                        <span className="bg-amber-50 text-amber-500 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-100">Queued</span>
                      )}
                      {rec.status === 'Failed' && (
                        <span className="bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">Failed</span>
                      )}
                      {rec.status === 'Pending' && (
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse border">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-500 pr-6">
                      <div className="space-y-0.5">
                        <p>Sent: {rec.sentAt ? new Date(rec.sentAt).toLocaleTimeString() : 'Pending'}</p>
                        {rec.deliveredAt && <p className="text-[#22c55e]">Delivered: {new Date(rec.deliveredAt).toLocaleTimeString()}</p>}
                        {rec.failedAt && <p className="text-[#ef4444]">Failed: {new Date(rec.failedAt).toLocaleTimeString()}</p>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-slate-300" />
            <div>
              <h3 className="font-bold text-gray-600">No logs found</h3>
              <p className="text-xs text-gray-400 mt-1">No recipients mapped to the chosen filter.</p>
            </div>
          </div>
        )}

      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition animate-slide-in"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition animate-slide-in"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}


    </div>
  );
}
