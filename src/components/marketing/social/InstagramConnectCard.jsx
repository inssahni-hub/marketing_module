import React from 'react';
import { Instagram, Link2, Unlink, CheckCircle2, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

export default function InstagramConnectCard({ connection, onConnect, onDisconnect, loading, onSyncAccount, onRefreshToken }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleOauthConnect = () => {
    // Both connect buttons trigger the unified Meta Login flow
    const authUrl = `${API_BASE_URL}/api/marketing/facebook/oauth/login`;
    const authWindow = window.open(authUrl, 'meta_oauth_popup', 'width=600,height=700');
    if (!authWindow) {
      alert('Please allow popups to connect your Meta account.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="ig-connect-card">
      <div className="p-5 flex items-start justify-between bg-slate-50/60 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-pink-50 text-pink-600 p-2.5 rounded-lg border border-pink-100">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Instagram Ads & Media</h3>
            <p className="text-xs text-slate-500">Boost Reels and track tickets purchased from visual media</p>
          </div>
        </div>

        {connection && connection.status === 'active' && connection.instagramBusinessId ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
         ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 text-slate-500 bg-slate-100 rounded-full">
            Disconnected
          </span>
        )}
      </div>

      <div className="p-5 font-sans">
        {connection && connection.status === 'active' && connection.instagramBusinessId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              <img
                src={connection.instagramProfilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt="Profile"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-pink-100 font-bold text-center text-xs"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-800 text-[13px] block">@{connection.instagramUsername || 'instagram_user'}</span>
                <span className="text-[10px] text-slate-400 block font-mono truncate">Business ID: {connection.instagramBusinessId}</span>
                <span className="text-[11px] text-slate-500 block truncate">
                  FB Page: <strong className="font-medium text-slate-700">{connection.pageName || 'Connected Page'}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-semibold text-center text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Protocol</span>
                <span className="text-pink-600 block mt-0.5 font-mono">Meta API</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase">Token Session</span>
                <span className="text-slate-600 block mt-0.5">Active</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (onSyncAccount) onSyncAccount();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sync Account
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onRefreshToken) onRefreshToken();
                  else handleOauthConnect();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Refresh Token
              </button>

              <button
                type="button"
                onClick={() => onDisconnect(connection.instagramBusinessId)}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect your professional Instagram Business accounts securely via unified Meta Single Sign-On to sync media metrics, Reel boost analytics and conversions.
            </p>
            <button
              type="button"
              onClick={handleOauthConnect}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-bold shadow transition cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
              Connect Meta Account
            </button>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-slate-400" /> Secure OAuth session logic with token encryption
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
