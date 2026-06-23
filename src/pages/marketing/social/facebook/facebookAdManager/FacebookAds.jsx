import React from 'react';
import { 
  Eye, 
  MessageSquare, 
  Share2, 
  ThumbsUp, 
  Sparkles, 
  Image as ImageIcon 
} from 'lucide-react';

export default function FacebookAds({ ads, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="h-96 bg-gray-100 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center col-span-full">
        <ImageIcon size={24} className="text-slate-400 mb-2" />
        <h5 className="font-semibold text-slate-700 text-sm">No Ads Active in this Set</h5>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          No ad creatives are delivering under current settings. Check if assets or copy require review.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <div 
          key={ad.id}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-350/40 hover:bg-white/85 hover:-translate-y-0.5 transition duration-300 flex flex-col"
        >
          {/* Header information */}
          <div className="p-4 border-b border-slate-200/40 bg-white/40 flex justify-between items-center">
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-800 text-xs truncate max-w-[160px]">{ad.name}</h4>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight block">ID: {ad.id}</span>
            </div>
            <div>
              {ad.status === 'ACTIVE' ? (
                <span className="text-[9px] bg-emerald-50/80 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                  ACTIVE
                </span>
              ) : (
                <span className="text-[9px] bg-amber-50/80 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-100">
                  PAUSED
                </span>
              )}
            </div>
          </div>

          {/* Facebook Mock Feed Card */}
          <div className="p-4 flex-1 flex flex-col space-y-3.5">
            {/* Feed Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center font-bold text-white text-xs shadow-inner shadow-blue-600/20">
                H
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11.5px] font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                  Happnex Ticketing
                  <span className="inline-block bg-blue-555 bg-blue-500 text-white text-[7px] px-1 py-0.5 font-bold rounded-lg uppercase tracking-wider scale-95 origin-left shadow-xs">
                    Sponsored
                  </span>
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium leading-none">Just now</span>
              </div>
            </div>

            {/* Post text */}
            <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line text-justify">
              {ad.creative.body}
            </p>

            {/* Media container */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/40 bg-zinc-100">
              <img 
                src={ad.creative.image_url} 
                alt={ad.creative.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>

            {/* CTA action layer */}
            <div className="bg-white/45 border border-white/50 p-3.5 rounded-xl flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">HAPPNEX.COM</span>
                <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">{ad.creative.name}</span>
              </div>
              <button 
                type="button"
                className="bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs border border-slate-200/40 active:scale-95 transition whitespace-nowrap"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Social metrics mock */}
          <div className="px-5 py-3 border-t border-slate-200/40 bg-white/30 backdrop-blur-xs flex justify-between items-center text-slate-400 text-xs font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold hover:text-blue-600 transition cursor-pointer">
                <ThumbsUp size={13} className="text-blue-500" /> 1.2K
              </span>
              <span className="flex items-center gap-1.5 font-semibold hover:text-blue-600 transition cursor-pointer">
                <MessageSquare size={13} /> 345
              </span>
            </div>
            <span className="flex items-center gap-1.5 font-semibold hover:text-blue-600 transition cursor-pointer">
              <Share2 size={13} /> Share Card
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
