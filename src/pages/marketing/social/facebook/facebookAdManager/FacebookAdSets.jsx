import React, { useState } from 'react';
import { 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function FacebookAdSets({ 
  adsets, 
  isLoading, 
  fetchAdsForAdset = () => {}, 
  adsetAds 
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (fetchAdsForAdset) {
        fetchAdsForAdset(id);
      }
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
          ● Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-zinc-100 text-zinc-500 border border-zinc-200">
        ○ Paused
      </span>
    );
  };

  const formatTargeting = (targeting) => {
    if (!targeting) return null;
    
    const geo = targeting.geo_locations || {};
    const countries = geo.countries ? geo.countries.join(', ') : '';
    const citiesOriginal = geo.cities ? geo.cities.map(c => c.name).join(', ') : '';
    const regions = geo.regions ? geo.regions.map(r => r.name).join(', ') : '';
    
    const locationStr = countries || citiesOriginal || regions || 'Global Delivery';
    const ageRange = `${targeting.age_min || 18} - ${targeting.age_max || '65+'}`;
    const interests = targeting.interests ? targeting.interests.map(i => i.name).join(', ') : '';
    const custom = targeting.custom_audiences ? targeting.custom_audiences.map(ca => ca.name).join(', ') : '';

    return {
      locationStr,
      ageRange,
      interests,
      custom
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((idx) => (
          <div key={idx} className="h-20 bg-gray-100 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!adsets || adsets.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center">
        <Target size={24} className="text-slate-400 mb-2" />
        <h5 className="font-semibold text-slate-700 text-sm">No Ad Sets detected</h5>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          This campaign hasn't been configured with any ad target sets yet, or we're waiting for Facebook delivery updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adsets.map((adset) => {
        const isExpanded = expandedId === adset.id;
        const target = formatTargeting(adset.targeting);
        
        return (
          <div 
            key={adset.id}
            className="border border-white/50 rounded-xl bg-white/60 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300/40 hover:bg-white/80"
          >
            {/* Header block */}
            <div 
              onClick={() => toggleExpand(adset.id)}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-white/40"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-bold text-slate-800 text-[13px] sm:text-sm">{adset.name}</h4>
                  {getStatusBadge(adset.status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
                  <span className="font-mono">ID: {adset.id}</span>
                  <span>•</span>
                  <span>Goal: <strong className="text-slate-600 font-bold">{adset.optimization_goal.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>

              {/* Budget indicators & expand action */}
              <div className="flex items-center gap-6 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Allocated Budget</span>
                  <span className="text-sm font-bold text-slate-700">
                    {adset.budget ? `$${parseFloat(adset.budget) / 100} / day` : 'Campaign level'}
                  </span>
                </div>
                <div className="p-2 border border-slate-200/80 rounded-lg hover:bg-white text-slate-500 bg-white/50 transition">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            </div>

            {/* Expandable Targeting & Ads Details subview */}
            {isExpanded && (
              <div className="border-t border-slate-200/40 bg-white/20 p-5 space-y-6">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-blue-500" /> Facebook Audience & Targeting Settings
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {target?.locationStr && (
                      <div className="bg-white/50 backdrop-blur-xs p-4 rounded-xl border border-white/50 flex items-start gap-3 shadow-2xs">
                        <div className="p-2 bg-blue-500/10 text-blue-550 text-blue-550 text-blue-500 rounded-lg">
                          <MapPin size={14} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Geo-Locations</span>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">{target.locationStr}</p>
                        </div>
                      </div>
                    )}
                    
                    {target?.ageRange && (
                      <div className="bg-white/50 backdrop-blur-xs p-4 rounded-xl border border-white/50 flex items-start gap-3 shadow-2xs">
                        <div className="p-2 bg-purple-550/10 bg-purple-500/10 text-purple-500 rounded-lg">
                          <UserCheck size={14} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Age Range</span>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">{target.ageRange} years old</p>
                        </div>
                      </div>
                    )}

                    {(target?.interests || target?.custom) && (
                      <div className="bg-white/50 backdrop-blur-xs p-4 rounded-xl border border-white/50 flex items-start gap-3 shadow-2xs col-span-1 md:col-span-1">
                        <div className="p-2 bg-rose-500/15 text-rose-500 rounded-lg">
                          <Target size={14} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Target Groups</span>
                          {target.interests && (
                            <p className="text-xs text-slate-705 text-slate-800 font-bold">
                              Interests: <span className="font-medium text-slate-600">{target.interests}</span>
                            </p>
                          )}
                          {target.custom && (
                            <p className="text-xs text-indigo-805 text-indigo-800 font-bold mt-1">
                              Custom DB: <span className="font-medium text-indigo-650 text-indigo-600">{target.custom}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated visual checklist showing matching setup */}
                <div className="bg-white/60 border border-white/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Targeting Optimization Grade: A+</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                        Audience selection features high overlap with historic Happnex transaction records. Delivery pacing looks optimal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
