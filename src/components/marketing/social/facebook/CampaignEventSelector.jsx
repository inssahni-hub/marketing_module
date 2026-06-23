import React, { useState, useEffect } from 'react';
import { Calendar, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

export default function CampaignEventSelector({ campaignId, onEventSelected, activeEventId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await FacebookApiService.getHappnexEvents();
        setEvents(res || []);
      } catch (err) {
        setErrorMsg('Could not fetch ticketing events checklist.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSelect = async (eventObj) => {
    if (!campaignId) {
      setErrorMsg('Configure a corporate Campaign before mapping standard ticketing events.');
      return;
    }
    setSavingId(eventObj._id);
    setErrorMsg(null);
    try {
      await FacebookApiService.mapPromotedEvent({
        campaignId,
        eventId: eventObj._id
      });
      if (onEventSelected) {
        onEventSelected(eventObj);
      }
    } catch (err) {
      setErrorMsg('Failed to persist events correlation state.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-5.5 h-5.5 text-blue-600" />
            Promoted Event Channel
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Map which corporate live ticket catalog will serve as the landing page trigger to trace conversion values.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-450 mt-2 font-medium">Loading live Happnex catalogs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((evt) => {
            const isSelected = activeEventId === evt._id;
            const isSaving = savingId === evt._id;

            return (
              <div
                key={evt._id}
                onClick={() => !isSaving && handleSelect(evt)}
                className={`group relative overflow-hidden rounded-xl border p-3 flex gap-4 transition-all duration-300 cursor-pointer ${isSelected
                    ? 'border-blue-600 bg-blue-50/15 ring-2 ring-blue-105'
                    : 'border-slate-250 bg-slate-50/20 hover:border-blue-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
              >

                <div className="flex items-center gap-4 relative">
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                      <span className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                  <img
                    src={evt.banners?.[0].square}
                    alt={evt.title}
                    loading="lazy"
                    className="h-12 w-12 rounded-lg object-cover border"
                    onError={(e) => {
                      e.currentTarget.src = "/event-placeholder.png";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-[15px] truncate mb-2">
                      {evt.title}
                    </p>
                  </div>
                </div>


              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
