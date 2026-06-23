import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, HelpCircle, Code, ShieldCheck, Database, Key, Check, Info } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
  const SENDGRID_FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      // Basic simulation check
      const res = await emailApi.checkSendGridConfig();
      setConfig(res);
    } catch (err) {
      console.error('Failed fetching settings keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    const rawUrl = `${window.location.origin}/api/marketing/email/webhooks/sendgrid`;
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800">Email Module Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Review API secrets configuration status, sender addresses, and webhook triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side credentials checks */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
            
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#2189ed]" /> API Configuration Status
            </h3>

            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">SendGrid API Secret Key</p>
                  <p className="text-[10px] text-slate-400">Environment key: <strong className="font-mono text-slate-600">SENDGRID_API_KEY</strong></p>
                </div>
                {SENDGRID_API_KEY ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> LIVE CONNECTED
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> SANDBOX SIMULATOR
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Outbound From Email Sender Address</p>
                  <p className="text-[10px] text-slate-400">Environment key: <strong className="font-mono text-slate-600">SENDGRID_FROM_EMAIL</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{SENDGRID_FROM_EMAIL || 'no-reply@eventhub.com'}</p>
                  <p className="text-[9px] text-slate-400">Configured Sender</p>
                </div>
              </div>

            </div>

            <div className="bg-[#eef6ff] p-4 rounded-xl border border-[#2189ed]/10 text-xs text-slate-600 space-y-2 leading-relaxed">
              <h4 className="font-bold text-[#1b74ca] flex items-center gap-1.5">
                💡 Sandbox Experience Guard
              </h4>
              <p>Because SendGrid accounts require domain validation keys, this application features an integrated **Outbound Simulator Sandbox**.</p>
              <p>If no `SENDGRID_API_KEY` is present inside your environment Secrets, clicking **Dispatch** compiles individual recipient logs inside Mongoose and simulates delivery, opens, and website click logs with progressive curves automatically!</p>
            </div>

          </div>

          {/* Webhook Settings information card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
            
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-600" /> Webhook Event Receptor
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">To synchronize live Outbound Delivered, Opened, Clicked, and Bounced states directly back to your multi-tenant analytics dashboard, configure webhooks inside SendGrid console:</p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider block">RECEPTOR ENDPOINT URL (COPY)</span>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/api/marketing/email/webhooks/sendgrid`}
                  className="w-full bg-slate-100 px-3 py-2 rounded-lg border font-mono text-[10px] text-slate-600 outline-none"
                />
                <button 
                  onClick={copyWebhookUrl}
                  className="px-4 py-1.5 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center justify-center min-w-[70px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right side helper documentation */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4 text-xs leading-relaxed text-slate-600">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Integration Guide</h3>
            <p>Ready to connect real emailing? Input your registered credentials inside the Secrets manager on AI Studio menu:</p>
            
            <div className="space-y-3 font-mono text-[10px] bg-slate-50 p-3 rounded-lg border">
              <div>
                <p className="font-bold text-slate-700">1. SENDGRID_API_KEY</p>
                <p className="text-slate-400">Add the full API Key token (starts with SG.)</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-bold text-slate-700">2. SENDGRID_FROM_EMAIL</p>
                <p className="text-slate-400">Match the Single Sender address verified on SendGrid</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
