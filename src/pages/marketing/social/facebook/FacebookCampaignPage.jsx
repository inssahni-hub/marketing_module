import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, AlertCircle, RefreshCw, FolderSearch, Calendar, ArrowRight, Table } from 'lucide-react';
import FacebookApiService from '@/services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookCampaignPage({ onCampaignCreated, activeCampaignId }) {
  const [name, setName] = useState('');
const [objective, setObjective] = useState('OUTCOME_TRAFFIC');
  const [budgetType, setBudgetType] = useState('DAILY');
  const [budget, setBudget] = useState(15.00);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [campaignsList, setCampaignsList] = useState([]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await FacebookApiService.getCampaigns();
      setCampaignsList(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Campaign Name is required.');
      return;
    }

    if (!objective) {
      setErrorMsg('Please select a campaign objective.');
      return;
    }

   

    if (!startDate) {
      setErrorMsg('Start Date is required.');
      return;
    }

    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setErrorMsg('End Date must be after Start Date.');
        return;
      }
    }

    setSaving(true);

    try {
      const res = await FacebookApiService.createCampaign({
        name: name.trim(),
        objective,
       
        startDate,
        endDate: endDate || null
      });

      setSuccessMsg(
        `Campaign "${name}" created successfully.`
      );

      setName('');
      setBudget(15);
      setEndDate('');

      fetchCampaigns();

      if (onCampaignCreated) {
        onCampaignCreated(res.campaign);
      }

    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
        'Creating Facebook Campaign failed.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Creation form */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Target className="text-blue-600 w-5.5 h-5.5" />
            Campaign Configurator
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Establish corporate bidding levels, define targeted budget pools daily or lifetime, and schedule live run pipelines.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs font-medium text-rose-700">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-xs font-medium text-emerald-800 animate-fade-in">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Rave Festival Conversions"
              className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Campaign Objective</label>
             <select
             className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
  value={objective}
  onChange={(e) => setObjective(e.target.value)}
>
  <option value="OUTCOME_TRAFFIC">
    Website Traffic
  </option>

  <option value="OUTCOME_AWARENESS">
    Brand Awareness
  </option>

  <option value="OUTCOME_ENGAGEMENT">
    Engagement
  </option>

  <option value="OUTCOME_LEADS">
    Lead Generation
  </option>

  <option value="OUTCOME_SALES">
    Ticket Sales
  </option>
</select>
             
            </div>

            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Compiling Meta Campaign...
              </>
            ) : (
              'Create Facebook Campaign'
            )}
          </button>
        </form>
      </div>

      {/* Campaigns Listing Panel */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderSearch className="text-blue-600 w-5.5 h-5.5" />
            Campaign Catalog
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Select or click any item below to load dynamic targets, check creatives, or view detailed insight charts.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 flex-1">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-450 mt-2 font-medium">Drafting active accounts...</span>
          </div>
        ) : campaignsList.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex-1 flex flex-col justify-center items-center">
            <FolderSearch className="w-9 h-9 text-slate-350 mb-2" />
            <span className="text-xs text-slate-400 font-medium">No active campaigns mapped</span>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[380px] flex-1 pr-1 flex flex-col gap-3">
            {campaignsList.map((item) => {
              const isActive = activeCampaignId === item._id;

              return (
                <div
                  key={item._id}
                  onClick={() => onCampaignCreated && onCampaignCreated(item)}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 cursor-pointer ${isActive
                    ? 'border-blue-600 bg-blue-50/15 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-xs'
                    }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate leading-tight transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-450 flex items-center gap-1.5 mt-1.5">
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60">ID: {item.facebookCampaignId || 'OFFLINE'}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-blue-600 uppercase tracking-wider text-[9px]">{item.objective.replace('OUTCOME_', '')}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold block text-slate-950 leading-none">
                        ${item.budget}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        {item.budgetType}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border ${item.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : item.status === 'PAUSED'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : item.status === 'REVIEW'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
