import React, { useState, useEffect } from 'react';
import { Facebook, CheckCircle2, AlertCircle, Link, Unlink, RefreshCw, Layers, ShieldCheck, Instagram } from 'lucide-react';
import FacebookApiService from '@/services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookConnection({ onConnectionChange }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch active connection details
  const fetchConnection = async () => {
    setLoading(true);
    try {
      const res = await FacebookApiService.getConnection();
      setConnectionDetails(res.connection || null);
      if (onConnectionChange) {
        onConnectionChange(res.connection || null);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to check Facebook integration state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnection();

    // Listen to OAUTH_AUTH_SUCCESS from our callback window of Express
    const handleOAuthMessage = (event) => {
      const origin = event.origin;
      // Allow relative or standard run.app origins
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('0.0.0.0')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchConnection();
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleConnect = async () => {
    setErrorMsg(null);
    try {
      const { url } = await FacebookApiService.getAuthUrl();
      
      // Calculate layout coordinates to center the popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        url,
        'fb_marketing_oauth_handshake',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!authWindow) {
        setErrorMsg('Authentication popup was blocked! Provide license to show popups.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Connecting to Meta authentication portal failed.');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Facebook Ad Account connection? Event Ads deployment will stop.')) {
      return;
    }
    setErrorMsg(null);
    try {
      await FacebookApiService.disconnect();
      setConnectionDetails(null);
      if (onConnectionChange) {
        onConnectionChange(null);
      }
    } catch (err) {
      setErrorMsg('Disconnect routine failed.');
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await FacebookApiService.sync();
      await fetchConnection();
    } catch (err) {
      setErrorMsg('Failed to sync Meta metrics.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Facebook className="w-6 h-6 text-blue-600 shrink-0" />
            Meta Integration Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synchronize campaigns, map digital assets, schedule target ad sets, and track pixel performance on Meta Ads Manager.
          </p>
        </div>

        {connectionDetails && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Meta'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 mt-3 font-medium">Loading Meta configuration details...</span>
        </div>
      ) : connectionDetails ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Connected Account */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Facebook className="w-5 h-5" />
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Connected
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Meta Profile</span>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight mt-1 truncate">
                {connectionDetails.facebookUserName || 'Active Profile'}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 font-medium truncate">ID: {connectionDetails.facebookUserId}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Linked</span>
                <span className="font-medium text-slate-600">June 2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: Page Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200/50">
                <Layers className="w-5 h-5" />
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Page
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Connected Page</span>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight mt-1 truncate font-sans">
                {connectionDetails.pageName || 'No page mapped'}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 font-medium truncate">ID: {connectionDetails.pageId || 'Pending'}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Linked</span>
                <span className="font-medium text-slate-600">June 2026</span>
              </div>
            </div>
          </div>

          {/* Card 3: Instagram Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-100/50">
                <Instagram className="w-5 h-5" />
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Linked Business
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Instagram Account</span>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight mt-1 truncate">
                {connectionDetails.instagramUsername ? `@${connectionDetails.instagramUsername}` : 'Instagram Feed Sync'}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 font-medium truncate">ID: {connectionDetails.instagramBusinessId || 'Default Business'}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Linked</span>
                <span className="font-medium text-slate-600">June 2026</span>
              </div>
            </div>
          </div>

          {/* Card 4: Ad Account Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/55">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Ad set
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enterprise Account</span>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight mt-1 truncate">
                Ad Account #{connectionDetails.adAccountId?.split('_')[1] || 'Primary'}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 font-medium truncate">{connectionDetails.adAccountId || 'Pending Assignment'}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Linked</span>
                <span className="font-medium text-slate-600">June 2026</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
            <Facebook className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">Configure Meta Credentials</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Link your Facebook Business Ad Account to begin publishing live campaign audiences and direct ticketholder ticket conversions.
          </p>
          <button
            onClick={handleConnect}
            className="mt-6 px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow shadow-blue-500/20 active:translate-y-px"
          >
            <Link className="w-4 h-4" />
            Connect Facebook OAuth
          </button>
        </div>
      )}
    </div>
  );
}
