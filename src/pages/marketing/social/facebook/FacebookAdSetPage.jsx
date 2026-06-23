import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Sliders, ToggleLeft } from 'lucide-react';
import AudienceBuilder from '@/components/marketing/social/facebook/AudienceBuilder.jsx';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookAdSetPage({ campaignId, audienceId, defaultBudget, onAdSetCreated }) {
  const [name, setName] = useState('');
  const [optimizationGoal, setOptimizationGoal] = useState('OFFSITE_CONVERSIONS');
  const [billingEvent, setBillingEvent] = useState('IMPRESSIONS');
  const [budgetType, setBudgetType] = useState('DAILY');
  const [budget, setBudget] = useState(defaultBudget || 15.00);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const [showAudienceModal, setShowAudienceModal] = useState(false);

  const [audiences, setAudiences] = useState([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState(audienceId || '');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync props change
  useEffect(() => {
    if (audienceId) {
      setSelectedAudienceId(audienceId);
    }
    if (defaultBudget) {
      setBudget(defaultBudget);
    }
  }, [audienceId, defaultBudget]);

  const fetchAudiences = async () => {
    setLoading(true);

    try {
      const list = await FacebookApiService.getAudiences();

      setAudiences(list || []);

      if (list?.length > 0 && !selectedAudienceId) {
        setSelectedAudienceId(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to load audiences', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAudiences();
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignId) {
      setErrorMsg('Choose or create a Campaign before configuring target Ad Sets.');
      return;
    }
    if (!selectedAudienceId) {
      setErrorMsg('A valid Saved Target Audience must be selected.');
      return;
    }
    if (!name) {
      setErrorMsg('Define a name for this Ad Set compilation.');
      return;
    }
    if (budgetType === 'DAILY' && Number(budget) < 5) {
      setErrorMsg('Facebook requires minimum $5/day budget.');
      return;
    }

    if (
      endDate &&
      new Date(endDate) <= new Date(startDate)
    ) {
      setErrorMsg(
        'End Date must be greater than Start Date.'
      );
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await FacebookApiService.createAdSet({
        campaignId,
        audienceId: selectedAudienceId,
        name,
        optimizationGoal,
        billingEvent,
        budgetType,
        budget: Number(budget),
        startDate,
        endDate: endDate || null
      });

      setSuccessMsg(`Meta AdSet "${name}" created and synced successfully! Meta ID: ${res.adSet?.facebookAdSetId || 'OFFLINE'}`);

      if (onAdSetCreated) {
        onAdSetCreated(res.adSet);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Creating Facebook AdSet failed.');
    } finally {
      setSaving(false);
    }
  };

  const selectedAudience = audiences.find(a => a._id === selectedAudienceId);
  const canCreate = campaignId && selectedAudienceId && audiences.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs animate-fade-in">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Sliders className="w-5.5 h-5.5 text-blue-600" />
          Ad Set Configurator
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Configure budget allocations, align campaign optimization targets, apply saved event audiences, and establish scheduling boundaries.
        </p>
      </div>
     
  
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-450 mt-2 font-medium">Fetching saved profiles...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Ad Set Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., California Tech Lovers Set"
              className="w-full text-xs font-medium border border-slate-250 focus:border-blue-550 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none transition-all text-slate-950 placeholder-slate-400 font-sans"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                Mapped Target Audience
              </label>

              <button
                type="button"
                onClick={() => setShowAudienceModal(true)}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                +
                Add Audience
              </button>
            </div>

            <select
              value={selectedAudienceId}
              onChange={(e) => setSelectedAudienceId(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
              required
            >
              {audiences.length === 0 ? (
                <option value="">
                  No audiences available
                </option>
              ) : (
                audiences.map((aud) => (
                  <option key={aud._id} value={aud._id}>
                    {aud.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Optimization Goal</label>
            <select
              value={optimizationGoal}
              onChange={(e) => setOptimizationGoal(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
            >
              <option value="OFFSITE_CONVERSIONS">Ticket Sales (Recommended)</option>
              <option value="LANDING_PAGE_VIEWS">Landing Page Views</option>
              <option value="LINK_CLICKS">Website Traffic</option>
              <option value="REACH">Brand Reach</option>
              <option value="IMPRESSIONS">Maximum Visibility</option>

            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Billing Event (When Facebook charges)</label>
            <select
              value={billingEvent}
              onChange={(e) => setBillingEvent(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
            >
              <option value="IMPRESSIONS">Impressions (Default - dynamic charging)</option>
              <option value="LINK_CLICKS">Link Clicks (Charged only when clicked)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Ad Set Specific Budget</label>
            <div className="flex gap-2">
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="border border-slate-250 focus:border-blue-500 px-3 py-3 rounded-lg outline-none text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-50 cursor-pointer transition-all"
              >
                <option value="DAILY">Daily</option>
                <option value="LIFETIME">Lifetime</option>
              </select>
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3.5 text-xs font-semibold text-slate-400">USD</span>
                <input
                  type="number"
                  min={5}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 pl-14 pr-3 py-3 rounded-lg outline-none text-slate-900 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none transition-all text-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving || !canCreate}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Compiling Ad Set on Meta...
                </>
              ) : (
                'Create and Sync Ad Set'
              )}
            </button>
          </div>
        </form>
      )}
      {showAudienceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">

            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Create Audience
              </h2>

              <button
                type="button"
                onClick={() => setShowAudienceModal(false)}
                className="text-slate-500 hover:text-slate-900 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <AudienceBuilder
                onAudienceSaved={async (aud) => {
                  await fetchAudiences();

                  setSelectedAudienceId(aud._id);

                  setShowAudienceModal(false);
                }}
              />
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
