import React, { useState } from 'react';
import { Target, Activity, Share2, PlusCircle, Sparkles, Filter, Database, Calendar } from 'lucide-react';

export default function ConversionTable({ conversions, onSimulatePurchase, attribution }) {
  const [amount, setAmount] = useState('75');
  const [sourceChannel, setSourceChannel] = useState('facebook');
  const [campaignId, setCampaignId] = useState('');
  const [eventId, setEventId] = useState('evt_summer_party_2026');

  const handleSimulate = (e) => {
    e.preventDefault();
    const randomBookingId = 'bk_' + Math.floor(100000 + Math.random() * 900000);
    const eventNameMap = {
      'evt_summer_party_2026': 'Summer Music Festival 2026',
      'evt_techno_rave_2026': 'Techno Rave Electronic Weekend',
      'evt_carnival_2026': 'Hip Hop Carnival Event'
    };

    onSimulatePurchase({
      bookingId: randomBookingId,
      eventId,
      eventName: eventNameMap[eventId],
      conversionType: 'purchase',
      source: sourceChannel,
      campaignId: campaignId || undefined,
      value: parseFloat(amount),
      currency: 'USD',
      utmSource: sourceChannel,
      utmMedium: 'paid_ads',
      utmCampaign: 'simulated_conversion'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="conversion-table-view">
      {/* Simulation Playground */}
      <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Pixel Conversion Playground</h3>
              <p className="text-[11px] text-slate-400">Trigger standard Web Checkout Purchases to test Pixel/Attribution</p>
            </div>
          </div>

          <form onSubmit={handleSimulate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ticket Purchase Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Traffic Source Channel</label>
              <select
                value={sourceChannel}
                onChange={(e) => setSourceChannel(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium"
              >
                <option value="facebook">Meta Facebook Ads (utm_source=fb)</option>
                <option value="instagram">Instagram Ads Boost (utm_source=ig)</option>
                <option value="google_ads">Google PPC Search (gclid_id)</option>
                <option value="email">Marketing Newsletter (utm_medium=email)</option>
                <option value="direct">Direct Traffic (organic/direct)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Associate Campaign Id (optional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium"
              >
                <option value="">-- No Ad Campaign Linked --</option>
                <option value="fb_camp_901">FB: Summer Music Fest Ticket Conversions</option>
                <option value="fb_camp_902">FB: Electronic Rave Weekend Retargeting</option>
                <option value="ig_camp_001">IG: IG Stories Ticketing Blitz</option>
                <option value="goo_camp_441">GOO: Google Search Tickets</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Ticket Listing</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700 font-medium"
              >
                <option value="evt_summer_party_2026">Summer Music Festival 2026</option>
                <option value="evt_techno_rave_2026">Techno Rave Electronic Weekend</option>
                <option value="evt_carnival_2026">Hip Hop Carnival Event</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" /> Trigger Pixel Order
            </button>
          </form>
        </div>

        <div className="mt-4 p-3.5 bg-slate-50 border border-indigo-50 rounded-lg text-[11px] text-slate-500 leading-normal">
          <span className="font-semibold text-indigo-700 flex items-center gap-1 mb-1">
            <Sparkles className="h-3 w-3" /> Multi-Touch Attribution Engine
          </span>
          Clicks containing <code>fbc_cookie</code>, <code>fbp_cookie</code>, or <code>gclid</code> tokens are automatically resolved and credited in database campaign statistics.
        </div>
      </div>

      {/* Conversion Logs */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Conversion Pixel Log File</h3>
              <p className="text-xs text-slate-500">Live order captures streaming from checkout triggers</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-semibold font-mono flex items-center gap-1">
              <Database className="h-3 w-3" /> {conversions.length} records
            </span>
          </div>

          <div className="overflow-y-auto max-h-[360px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-semibold sticky top-0 bg-white">
                  <th className="py-2 px-4">Booking ID</th>
                  <th className="py-2 px-4">Event Details</th>
                  <th className="py-2 px-4">Referrer Source</th>
                  <th className="py-2 px-4 text-right">Value</th>
                  <th className="py-2 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      No conversions logged yet. Trigger a sample Ticket purchase above!
                    </td>
                  </tr>
                ) : (
                  conversions.slice(0, 15).map((con) => (
                    <tr key={con.bookingId} className="hover:bg-slate-50/40 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{con.bookingId}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{con.eventName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">ID: {con.eventId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          con.source === 'facebook'
                            ? 'bg-blue-50 text-blue-700'
                            : con.source === 'instagram'
                            ? 'bg-pink-50 text-pink-700'
                            : con.source === 'google_ads'
                            ? 'bg-emerald-50 text-emerald-700'
                            : con.source === 'email'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {con.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">${parseFloat(con.value).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(con.convertedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
          <span className="text-slate-400">Database Engine: <strong className="text-slate-600 font-mono text-[11px]">Mongoose (MongoDB)</strong></span>
          <span className="text-slate-400">Attribution Type: <strong className="text-slate-600">Last Touch Pixel</strong></span>
        </div>
      </div>
    </div>
  );
}
