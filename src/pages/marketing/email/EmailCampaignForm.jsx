import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, HelpCircle, Code, Eye, Calendar, Users, AlertCircle } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailCampaignForm({ campaignToEdit, onCancel, onSuccess }) {
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceType, setAudienceType] = useState('All Buyers');
  const [targetEventId, setTargetEventId] = useState('');
  const [customRecipientsText, setCustomRecipientsText] = useState('');
  
  const [scheduledAt, setScheduledAt] = useState('');
  const [sendImmediately, setSendImmediately] = useState(true);

  // Lists loaded dynamically from backend collections
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [quotaRemaining, setQuotaRemaining] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [eventsRes, templatesRes, usageRes] = await Promise.all([
        emailApi.getEvents(),
        emailApi.getTemplates({ limit: 100 }),
        emailApi.getUsage()
      ]);

      if (eventsRes.success) setEvents(eventsRes.data);
      if (templatesRes.success) setTemplates(tpl => templatesRes.data);
      if (usageRes.success) setQuotaRemaining(usageRes.data.emailsRemaining);

      // Seed editing details once lists are fetched
      if (campaignToEdit) {
        setCampaignName(campaignToEdit.campaignName || '');
        setSubject(campaignToEdit.subject || '');
        setHtmlContent(campaignToEdit.htmlContent || '');
        setTemplateId(campaignToEdit.templateId || '');
        setAudienceType(campaignToEdit.audienceType || 'All Buyers');
        setTargetEventId(campaignToEdit.targetEventId || '');
        setSendImmediately(campaignToEdit.sendImmediately !== undefined ? campaignToEdit.sendImmediately : true);
        
        if (campaignToEdit.customRecipients) {
          setCustomRecipientsText(campaignToEdit.customRecipients.join('\n'));
        }

        if (campaignToEdit.scheduledAt) {
          // Format Date to datetime-local string
          const dateStr = new Date(campaignToEdit.scheduledAt).toISOString().slice(0, 16);
          setScheduledAt(dateStr);
        }
      }
    } catch (err) {
      console.error('Metadata fetch failed:', err);
      setError('Failed resolving configuration dependencies.');
    }
  };

  // Populate editor fields automatically when selecting another template preset
  const handleTemplateChange = async (tplId) => {
    setTemplateId(tplId);
    if (!tplId) return;

    try {
      const res = await emailApi.getTemplateById(tplId);
      if (res.success) {
        setSubject(res.data.subject);
        setHtmlContent(res.data.htmlContent);
      }
    } catch (err) {
      console.error('Failed copying template values:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignName.trim() || !subject.trim() || !htmlContent.trim()) {
      setError('Campaign Name, Subject line, and Email Body Content are required parameters.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let customRecipients = [];
      if (audienceType === 'Custom Buyer Selection') {
        customRecipients = customRecipientsText
          .split('\n')
          .map(email => email.trim())
          .filter(email => email !== '' && email.includes('@'));
        
        if (customRecipients.length === 0) {
          setError('Please provide at least one valid email to standard custom recipient records.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        campaignName,
        subject,
        htmlContent,
        templateId: templateId || null,
        audienceType,
        targetEventId: targetEventId || null,
        customRecipients,
        sendImmediately,
        scheduledAt: sendImmediately ? null : scheduledAt
      };

      let res;
      if (campaignToEdit) {
        res = await emailApi.updateCampaign(campaignToEdit._id, payload);
      } else {
        res = await emailApi.createCampaign(payload);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to save campaign metadata.');
      }
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || err.message || 'Error occurred querying full stack.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Ribbon Header bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {campaignToEdit ? `Edit Campaign: ${campaignToEdit.campaignName}` : 'Compose New Email Campaign'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Configure target audience, choose style blueprints, and trigger scheduling
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Param settings container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b">Campaign Logistics</h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium leading-relaxed">
                <h3>Submit Rejected:</h3>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Campaign Name *
              </label>
              <input 
                type="text"
                placeholder="e.g., Summer Live Ticket Blast"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              />
            </div>

            {/* Layout loader preset */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Load Content Blueprint (optional)
              </label>
              <select 
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              >
                <option value="">-- Choose Preset Layout --</option>
                {templates.map(tpl => (
                  <option key={tpl._id} value={tpl._id}>{tpl.templateName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                E-mail Subject Title Header *
              </label>
              <input 
                type="text"
                placeholder="e.g., Get ready for summer live! 🎫 See you soon."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              />
            </div>

            {/* Audience builder */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Target Audience Category *
              </label>
              <select 
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              >
                <option value="All Buyers">All Registered Buyers</option>
                <option value="VIP Buyers">VIP Buyers (with isVip true)</option>
                <option value="Specific Event Buyers">Specific Event Ticket Buyers</option>
                <option value="Custom Buyer Selection">Custom Inline Email Selection</option>
              </select>
            </div>

            {/* Event connector selector */}
            {(audienceType === 'Specific Event Buyers' || audienceType === 'Event Buyers') && (
              <div className="bg-slate-50 p-4 rounded-xl border">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Connect Target Event *
                </label>
                <select 
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
                >
                  <option value="">-- Select Active Event --</option>
                  {events.map((evt) => (
                    <option key={evt._id} value={evt._id}>{evt.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Queries ticket buyers associated with this unique collection on MongoDB.</p>
              </div>
            )}

            {/* Custom array entry parser */}
            {audienceType === 'Custom Buyer Selection' && (
              <div className="bg-slate-50 p-4 rounded-xl border">
                <label className="block text-xs font-bold text-[#2189ed] uppercase tracking-wide mb-1">
                  Custom Recipients Emails *
                </label>
                <textarea 
                  rows="3"
                  placeholder="Paste manual list of target emails, separated by line..."
                  value={customRecipientsText}
                  onChange={(e) => setCustomRecipientsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#2189ed] bg-white text-slate-800 resize-none"
                />
                <p className="text-[9px] text-slate-400 font-medium mt-1">Allows custom testing contacts before mass sending events.</p>
              </div>
            )}

            {/* Sending Scheduling timeline */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Delivery Schedule Option
              </label>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input 
                    type="radio"
                    checked={sendImmediately}
                    onChange={() => setSendImmediately(true)}
                    className="accent-[#2189ed]"
                  /> Send Instantly / Draft status
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input 
                    type="radio"
                    checked={!sendImmediately}
                    onChange={() => setSendImmediately(false)}
                    className="accent-[#2189ed]"
                    required
                  /> Set Schedule Time
                </label>
              </div>

              {!sendImmediately && (
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Scheduled Hour *
                  </label>
                  <input 
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none bg-white text-slate-800"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Saves campaign state as "Scheduled" for the in-memory daemon runner.</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Discard
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-[#2189ed] hover:bg-[#1b74ca] text-white disabled:opacity-55 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : (campaignToEdit ? 'Save Edits' : 'Save Campaign')}
              </button>
            </div>

          </div>

          {quotaRemaining !== null && (
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center gap-2.5 text-xs text-slate-500">
              <Users className="w-5 h-5 text-[#2189ed]" />
              <p>Active Outbound plan remaining balance: <strong className="text-slate-800 font-bold">{quotaRemaining.toLocaleString()}</strong> credits.</p>
            </div>
          )}
        </div>

        {/* Real-time HTML payload viewer */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[450px]">
          
          <div className="px-6 py-3 border-b flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Code className="w-4 h-4 text-[#2189ed]" /> Campaign Body Rich Content
            </span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button 
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${activeTab === 'edit' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                Source CODE
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${activeTab === 'preview' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                Preview SCREEN
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 bg-slate-50 min-h-[400px]">
            {activeTab === 'edit' ? (
              <textarea 
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Compose newsletter or template HTML tags..."
                className="w-full flex-1 p-4 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#2189ed] bg-white text-slate-800 resize-none min-h-[350px] leading-relaxed"
                required
              />
            ) : (
              <div 
                className="w-full flex-1 p-6 bg-white border rounded-xl overflow-y-auto leading-normal min-h-[350px]"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>

        </div>

      </form>

    </div>
  );
}
