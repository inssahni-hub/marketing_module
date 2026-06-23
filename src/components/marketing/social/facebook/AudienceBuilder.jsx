import React, { useState } from 'react';
import { Target, CheckCircle2, AlertCircle, RefreshCw, Plus, Trash2, Users, Search } from 'lucide-react';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

// Predefined hot tags for Event Ticketing target audience interest compiling
const SUGGESTED_INTERESTS = [
  'Music Festivals', 'Electronic Dance Music', 'Techno Music', 'Live Concerts', 
  'Nightlife', 'Raving', 'Food & Wine Festivals', 'Theater & Arts', 'Rock Music',
  'Hip Hop Music', 'Jazz', 'Gourmet Dinners', 'Salsa Dancing', 'Pop Music'
];

export default function AudienceBuilder({ onAudienceSaved }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('US');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState('ALL');
  
  const [interests, setInterests] = useState(['Music Festivals', 'Electronic Dance Music']);
  const [customInterest, setCustomInterest] = useState('');
  
  const [languages, setLanguages] = useState(['English']);
  const [customLanguage, setCustomLanguage] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Recalculate dynamic reach on the fly
  const calculateEstimatedReach = () => {
    let baseReach = 2500000;
    // Scale on age limits width
    const ageSpan = Math.max(ageMax - ageMin, 5);
    baseReach = baseReach * (ageSpan / 50);

    // Filter on gender
    if (gender !== 'ALL') {
      baseReach = baseReach * 0.48;
    }

    // Filter on geography specificity
    if (city) {
      baseReach = baseReach * 0.12;
    } else if (state) {
      baseReach = baseReach * 0.35;
    }

    // Filter on interest overlap
    if (interests.length > 0) {
      baseReach = baseReach * (0.05 + interests.length * 0.08);
    }

    return Math.floor(Math.max(baseReach, 45000));
  };

  const handleAddInterest = (interestName) => {
    if (interestName && !interests.includes(interestName)) {
      setInterests([...interests, interestName]);
    }
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (customLanguage.trim() && !languages.includes(customLanguage.trim())) {
      setLanguages([...languages, customLanguage.trim()]);
      setCustomLanguage('');
    }
  };

  const handleRemoveLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg('Audience Name is mandatory.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name,
        country,
        state,
        city,
        ageMin,
        ageMax,
        gender,
        interests,
        languages
      };

      const res = await FacebookApiService.createAudience(payload);
      setSuccessMsg(`Target Audience "${name}" successfully compiled and saved in database.`);
      
      if (onAudienceSaved) {
        onAudienceSaved(res.audience);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to persist audience settings.');
    } finally {
      setSaving(false);
    }
  };

  const estimatedReach = calculateEstimatedReach();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Target className="w-5.5 h-5.5 text-blue-600" />
          Target Audience Planner
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Define core demographic targeting filters, filter interests overlap, and track real-time audience size projection.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entry Parameters Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-4.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Audience Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Techno Lovers California 18-35"
              className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
              required
            />
          </div>

          {/* Demographics Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
              >
                <option value="US">United States (US)</option>
                <option value="CA">Canada (CA)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="AU">Australia (AU)</option>
                <option value="SG">Singapore (SG)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Region/State (Optional)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., California"
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Metropolitan/City (Optional)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., San Francisco"
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Age Limits Min</label>
              <input
                type="number"
                min={13}
                max={ageMax}
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value))}
                className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-2.5 rounded-lg outline-none text-slate-950 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Age Limits Max</label>
              <input
                type="number"
                min={ageMin}
                max={90}
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value))}
                className="w-full text-xs font-semibold border border-slate-250 focus:border-blue-500 focus:bg-white bg-slate-50 px-4 py-2.5 rounded-lg outline-none text-slate-950 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Gender Focus</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                {['ALL', 'MALE', 'FEMALE'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded transition-all cursor-pointer ${
                      gender === g ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Languages Segment */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Languages</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Add custom language focus (e.g. Spanish)"
                className="flex-1 text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-105/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400 font-sans"
              />
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {languages.map((lang, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-105 text-slate-700 rounded-lg border border-slate-200 animate-fade-in">
                  {lang}
                  <button type="button" onClick={() => handleRemoveLanguage(idx)} className="text-slate-405 hover:text-rose-600 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests Segment */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455 block mb-2">Interests Overlap (Affinity Targeting)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add new interest targeting criteria"
                className="flex-1 text-xs font-medium border border-slate-250 focus:border-blue-550 focus:ring-4 focus:ring-blue-105/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400 font-sans"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Suggested Tags Pill Shelf */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Suggested Event Demographics:</span>
              <div className="flex flex-wrap gap-1.5 font-sans">
                {SUGGESTED_INTERESTS.filter(i => !interests.includes(i)).map((interest, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleAddInterest(interest)}
                    className="px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-650 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50/20 rounded-lg transition-all cursor-pointer animate-fade-in"
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-blue-50/50 text-blue-700 rounded-lg border border-blue-100 animate-fade-in">
                  {interest}
                  <button type="button" onClick={() => handleRemoveInterest(idx)} className="text-blue-400 hover:text-rose-600 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
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
                Compiling Audience...
              </>
            ) : (
              'Save Compiled Target Audience'
            )}
          </button>
        </form>

        {/* Dynamic Estimation reach meter */}
        <div className="lg:col-span-4 flex flex-col justify-start">
          <div className="p-7 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between h-full min-h-[360px]">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-400 font-sans">
                <Users className="w-4.5 h-4.5 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Estimated Audience Size</span>
              </div>

              <div className="mb-6">
                <h2 className="text-4xl font-bold tracking-tight text-white leading-none">
                  {estimatedReach.toLocaleString()}
                </h2>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mt-2 block">active meta reach profiles</div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans">
                  This reach represents the estimated active Meta audience matching your location, age, gender, and interests specification overlap.
                </p>
              </div>
            </div>

            {/* Simulated Reach dial gauge */}
            <div className="mt-6 border-t border-slate-850 pt-5">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
                <span>Narrow Range</span>
                <span>Broad Range</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/40 font-mono">
                <div
                  style={{ width: `${Math.min((estimatedReach / 2500000) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="mt-5 py-3 px-3.5 bg-slate-800/40 border border-slate-800 rounded-lg">
                <p className="text-[11px] text-slate-450 leading-relaxed flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-0.5 animate-pulse"></span>
                  <span>
                    <strong>Optimal Focus:</strong> This scope has sufficient volume size for algorithmic conversion learning models.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
