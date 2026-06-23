import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Eye, MousePointer, AlertCircle, Trash, ArrowLeft, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailAnalytics({ campaignId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering tracking logs
  const [logSearch, setLogSearch] = useState('');
  const [logStatus, setLogStatus] = useState('');

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await emailApi.getCampaignAnalytics(campaignId);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to retrieve metrics logs.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred querying analytic databases.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2189ed]"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium whitespace-nowrap font-mono">Aggregating logs data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-8 border border-slate-100 rounded-xl space-y-4">
        <div className="text-red-700 flex items-center gap-1.5 font-bold">
          <AlertCircle className="w-5 h-5" /> Analytics Load Error
        </div>
        <p className="text-sm text-slate-500">{error || 'Campaign records failed parsing.'}</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }

  const { campaign, stats, recipients } = data;

  // Filter logs locally
  const filteredRecipients = recipients.filter(rec => {
    const matchesKeyword = rec.email.toLowerCase().includes(logSearch.toLowerCase()) || 
                           (rec.buyerId?.name && rec.buyerId.name.toLowerCase().includes(logSearch.toLowerCase()));
    
    const matchesStatus = logStatus === '' || rec.status === logStatus;
    
    return matchesKeyword && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Back button ribbon strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Analytics Report: {campaign.campaignName}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Subject Heading: "{campaign.subject}"</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={fetchAnalytics}
            className="px-3.5 py-2 text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-sync Logs
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            Campaign List
          </button>
        </div>
      </div>

      {/* Main Stats Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Sent</p>
          <h4 className="text-2xl font-bold text-slate-800">{stats.totalSent}</h4>
          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">Mailed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivered</p>
          <h4 className="text-2xl font-bold text-[#2189ed]">{stats.delivered}</h4>
          <span className="text-[9px] bg-blue-50 text-[#2189ed] font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">Confirmed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Opened</p>
          <h4 className="text-2xl font-bold text-emerald-600">{stats.opened}</h4>
          <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            {stats.openRate}% Ratio
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clicked</p>
          <h4 className="text-2xl font-bold text-indigo-600">{stats.clicked}</h4>
          <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            {stats.clickRate}% CTR
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bounced</p>
          <h4 className="text-2xl font-bold text-amber-600">{stats.bounced}</h4>
          <span className="text-[9px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            {stats.bounceRate}% Bounce
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Failed</p>
          <h4 className="text-2xl font-bold text-red-600">{stats.failed}</h4>
          <span className="text-[9px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase mt-2 inline-block">Dropped</span>
        </div>

      </div>

      {/* Recipient level logs tracking list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        
        {/* Logs list filters header */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recipient Delivery Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tracking individual user interactions in real-time</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 self-stretch md:self-auto">
            <input 
              type="text"
              placeholder="Search recipient emails..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2189ed]"
            />
            <select 
              value={logStatus}
              onChange={(e) => setLogStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Delivered">Delivered</option>
              <option value="Opened">Opened</option>
              <option value="Clicked">Clicked</option>
              <option value="Bounced">Bounced</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {filteredRecipients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No matching delivery logs detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3">Recipient Identity</th>
                  <th className="px-6 py-3 text-center">Lifecycle Status</th>
                  <th className="px-6 py-3 text-center">Delivered At</th>
                  <th className="px-6 py-3 text-center">Opened At</th>
                  <th className="px-6 py-3 text-center">Clicked At</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecipients.map((rec) => (
                  <tr key={rec._id} className="text-xs text-slate-600 hover:bg-slate-50/25 transition">
                    
                    <td className="px-6 py-3">
                      <p className="font-semibold text-slate-800">{rec.buyerId?.name || 'Recipients List'}</p>
                      <p className="text-slate-400 font-mono text-[10px] mt-0.5">{rec.email}</p>
                    </td>

                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        rec.status === 'Opened' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'Clicked' ? 'bg-indigo-100 text-indigo-700 font-extrabold' :
                        rec.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                        rec.status === 'Pending' ? 'bg-slate-100 text-slate-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {rec.status?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-center font-mono text-[10px] text-slate-500">
                      {rec.deliveredAt ? new Date(rec.deliveredAt).toLocaleString() : '-'}
                    </td>

                    <td className="px-6 py-3 text-center font-mono text-[10px] text-slate-500">
                      {rec.openedAt ? new Date(rec.openedAt).toLocaleString() : '-'}
                    </td>

                    <td className="px-6 py-3 text-center font-mono text-[10px] text-slate-500">
                      {rec.clickedAt ? new Date(rec.clickedAt).toLocaleString() : '-'}
                    </td>

                    <td className="px-6 py-3 text-right max-w-[150px] truncate pr-6 text-[10px] text-slate-400 font-medium italic">
                      {rec.errorMessage || 'No delivery issues'}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
