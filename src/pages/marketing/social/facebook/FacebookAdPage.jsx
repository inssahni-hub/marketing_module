import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layout, Eye, Megaphone } from 'lucide-react';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookAdPage({ campaignId, adSetId, creativeId, onAdCreated }) {
  const [name, setName] = useState('');
  const [adSets, setAdSets] = useState([]);
  const [creatives, setCreatives] = useState([]);
  
  const [selectedAdSetId, setSelectedAdSetId] = useState(adSetId || '');
  const [selectedCreativeId, setSelectedCreativeId] = useState(creativeId || '');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync props change
  useEffect(() => {
    if (adSetId) {
      setSelectedAdSetId(adSetId);
    }
    if (creativeId) {
      setSelectedCreativeId(creativeId);
    }
  }, [adSetId, creativeId]);

  useEffect(() => {
    const fetchComponents = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const [adSetsList, creativeObj] = await Promise.all([
          FacebookApiService.getAdSets(campaignId),
          FacebookApiService.getCreative(campaignId)
        ]);
        console.log(adSetsList)
        
        setAdSets(adSetsList || []);
        if (adSetsList?.length > 0 && !selectedAdSetId) {
          setSelectedAdSetId(adSetsList[0].id);
        }

        if (creativeObj) {
          setCreatives([creativeObj]);
          if (!selectedCreativeId) {
            setSelectedCreativeId(creativeObj._id);
          }
        } else {
          setCreatives([]);
        }
      } catch (err) {
        console.error('Failed to grab associated resources for drafting active Facebook Ads.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignId) {
      setErrorMsg('Choose or create a Campaign before writing final Ads.');
      return;
    }
    if (!selectedAdSetId) {
      setErrorMsg('Please select a valid, compiled Ad Set.');
      return;
    }
    if (!selectedCreativeId) {
      setErrorMsg('An Event Ad Copy creative must be designed first.');
      return;
    }
    if (!name) {
      setErrorMsg('Specify a descriptive name for this Facebook Ad.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await FacebookApiService.createAd({
        campaignId,
        adSetId: selectedAdSetId,
        creativeId: selectedCreativeId,
        name
      });

      setSuccessMsg(`Meta Facebook Ad "${name}" deployed successfully! Meta ID: ${res.ad?.facebookAdId || 'OFFLINE'}`);

      if (onAdCreated) {
        onAdCreated(res.ad);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Spawning Facebook Ad failed.');
    } finally {
      setSaving(false);
    }
  };

  const activeCreative = creatives.find(c => c._id === selectedCreativeId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs animate-fade-in">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Megaphone className="w-5.5 h-5.5 text-blue-600" />
          Meta Ad Creator
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Tie customized design visuals to designated target audiences and launch live meta campaigns.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-emerald-850">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-450 mt-2 font-medium">Assembling active creatives...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ad settings Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-4.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Facebook Ad Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., California Conversions - Creative Variant A"
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400 font-sans"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Select Bidding Ad Set</label>
              <select
                value={selectedAdSetId}
                onChange={(e) => setSelectedAdSetId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
                required
              >
                {adSets.length === 0 ? (
                  <option value="">No active Ad Sets configured for this campaign yet. Done step 5 first.</option>
                ) : (
                  adSets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.name} (Budget: USD {set.budget})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Select Visual Creative Mapped Copy</label>
              <select
                value={selectedCreativeId}
                onChange={(e) => setSelectedCreativeId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
                required
              >
                {creatives.length === 0 ? (
                  <option value="">No Ad Creative templates designed for this campaign. Done step 3 first.</option>
                ) : (
                  creatives.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.headline}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Meta Ad Node...
                </>
              ) : (
                'Instantiate & Sync Facebook Ad'
              )}
            </button>
          </form>

          {/* Mini Preview Deck */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {activeCreative ? (
              <div className="p-5 bg-slate-50 border border-slate-205 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-slate-450" />
                  Composed Creative Asset Linkage
                </span>

                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-200 border border-slate-200">
                  <img
                    src={activeCreative.bannerImage}
                    alt="Current Ad Creative Visual"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-4 py-3 px-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{activeCreative.headline}</h4>
                  <p className="text-[10.5px] text-blue-600 font-medium mt-1 truncate">{activeCreative.landingPageUrl}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Eye className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <span className="text-xs text-slate-450 font-semibold block">Creative preview unavailable</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
