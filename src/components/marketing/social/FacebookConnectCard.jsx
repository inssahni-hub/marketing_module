import React from 'react';
import { Facebook, Link2, Unlink, CheckCircle2, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

export default function FacebookConnectCard({ connection, onConnect, onDisconnect, loading, onSyncAccount, onRefreshToken }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleOauthConnect = () => {
    const authUrl = `${API_BASE_URL}/api/marketing/facebook/oauth/login`;
    const authWindow = window.open(authUrl, 'meta_oauth_popup', 'width=600,height=700');
    if (!authWindow) {
      alert('Please allow popups to connect your Meta account.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="fb-connect-card">
      <div className="p-5 flex items-start justify-between bg-slate-50/60 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
            <Facebook className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Facebook Ads Integration</h3>
            <p className="text-xs text-slate-500">Track event conversions and boost ticketing posts</p>
          </div>
        </div>

        {connection && connection.status === 'active' ? (
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
        {connection && connection.status === 'active' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Ad Account ID</span>
                  <span className="font-mono text-slate-700 font-bold block truncate">{connection.adAccountId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Connected page</span>
                  <span className="text-slate-700 font-bold block truncate">{connection.pageName || 'Unknown Page'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Meta Status</span>
                  <span className="font-mono text-slate-700 font-bold block">Active Session</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">API Protocol</span>
                  <span className="text-slate-700 font-bold flex items-center gap-1 block">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 inline shrink-0" /> Graph v19.0
                  </span>
                </div>
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
                Sync Ads Data
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onRefreshToken) onRefreshToken();
                  else handleOauthConnect();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Refresh Token
              </button>

              <button
                type="button"
                onClick={() => onDisconnect(connection.adAccountId)}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                Disconnect
              </button>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400">Connected by Meta: <strong className="font-semibold text-slate-500">{connection.connectedBy || 'Admin'}</strong></span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect your professional Facebook Pages & Ad Accounts securely via Meta Single Sign-On to drive ticketing conversions and synchronize metric tracking.
            </p>
            <button
              type="button"
              onClick={handleOauthConnect}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow transition cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4 fill-current" />}
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
