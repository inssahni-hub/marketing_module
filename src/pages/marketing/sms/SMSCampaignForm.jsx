import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import { ArrowLeft, Save, RefreshCw, AlertCircle, Info, Calendar, Sparkles, Send } from 'lucide-react';

export default function SMSCampaignForm({
  campaignToEdit = null,
  onCancel,
  onSuccess
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Core Dropdowns Data
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [quota, setQuota] = useState(null);

  // Form Fields
  const [campaignName, setCampaignName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceType, setAudienceType] = useState('All Buyers');
  const [targetEventId, setTargetEventId] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [runImmediately, setRunImmediately] = useState(true);

  const [errorHeader, setErrorHeader] = useState('');
  const [errors, setErrors] = useState({});

  // 1. Initial Data fetching
  useEffect(() => {
    const bootstrapFormData = async () => {
      try {
        const eventsRes = await smsApiService.getEvents();
        if (eventsRes.success) setEvents(eventsRes.data);

        const templatesRes = await smsApiService.getTemplates({ limit: 100 });
        if (templatesRes.success) setTemplates(templatesRes.data);

        const quotaRes = await smsApiService.getCurrentPlanAndUsage();
        if (quotaRes.success) setQuota(quotaRes.data.usage);

        if (isEditMode) {
          const campRes = await smsApiService.getCampaignById(id);
          if (campRes.success) {
            const data = campRes.data;
            setCampaignName(data.campaignName);
            setMessageBody(data.messageBody);
            setTemplateId(data.templateId || '');
            setAudienceType(data.audienceType || 'All Buyers');
            setTargetEventId(data.targetEventId?._id || '');

            if (data.scheduledAt) {
              setIsScheduled(true);
              setRunImmediately(false);
              // convert Date to datetime-local string
              const d = new Date(data.scheduledAt);
              // handle timezone iso conversion
              const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              setScheduledAt(localISO);
            }
          } else {
            setErrorHeader('Campaign not found.');
          }
        }
      } catch (err) {
        console.error(err);
        setErrorHeader('Failed to fetch required lists from ticketing backend.');
      } finally {
        setLoading(false);
      }
    };
    bootstrapFormData();
  }, [id, isEditMode]);

  // 2. Map template selection changes to auto-fill the body
  const handleTemplateSelection = (tid) => {
    setTemplateId(tid);
    if (!tid) return;

    const selected = templates.find(t => t._id === tid);
    if (selected) {
      setMessageBody(selected.messageBody);
    }
  };

  // 3. Save handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setErrorHeader('');

    // Pre-validations
    const clientErrors = {};
    if (!campaignName.trim()) {
      clientErrors.campaignName = 'Campaign name is required';
    }
    if (!messageBody.trim()) {
      clientErrors.messageBody = 'Message body is required';
    }
    if (audienceType === 'Event Buyers' && !targetEventId) {
      clientErrors.targetEventId = 'A target Event must be linked for Event Buyers targeting';
    }
    if (isScheduled && !scheduledAt) {
      clientErrors.scheduledAt = 'Scheduled date and time is required';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setSaving(false);
      return;
    }

    try {
      const payload = {
        campaignName,
        messageBody,
        templateId: templateId || undefined,
        audienceType,
        targetEventId: targetEventId || undefined,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
        status: isScheduled ? 'Scheduled' : (runImmediately ? 'Sent' : 'Draft')
      };

      let res;
      if (isEditMode) {
        res = await smsApiService.updateCampaign(id, payload);
      } else {
        res = await smsApiService.createCampaign(payload);
      }

      if (res.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (res.errors) {
          setErrors(res.errors);
        } else {
          setErrorHeader(res.error || 'Failed to save campaign campaign.');
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrorHeader(err.response?.data?.error || 'Database validation schema error.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fetching builder assets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Return Navigation */}
     

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Campaign Parameter Builder form */}
        <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden lg:col-span-2">

          <div className="p-5 border-b border-blue-50 bg-blue-50/20">
            <h1 className="text-base font-extrabold text-gray-800">
              {isEditMode ? 'Modify SMS Campaign' : 'Compose SMS Campaign'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Draft or schedule instant multi-tenant ticket holder broadcasts.
            </p>
          </div>

          {errorHeader && (
            <div className="m-5 mb-0 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-[#ef4444] font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorHeader}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* Field 1: Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g., Summer Sonic Gate Openings"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white ${errors.campaignName ? 'border-red-300' : 'border-blue-100/80'
                  }`}
              />
              {errors.campaignName && (
                <p className="text-[10px] font-bold text-[#ef4444]">{errors.campaignName}</p>
              )}
            </div>

            {/* Field 2: Audience Type and Event selector combined */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Target Audience</label>
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-100/80 rounded-xl focus:outline-none focus:border-[#2189ed] bg-white font-medium"
                >
                  <option value="All Buyers">All Ticket Buyers (Global Tenant)</option>
                  <option value="Event Buyers">Specific Event Buyers</option>
                  <option value="VIP Buyers">VIP Access Holders</option>
                  <option value="Past Buyers">Historic Buyers list</option>
                </select>
              </div>

              {audienceType === 'Event Buyers' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Link Ticketed Event</label>
                  <select
                    value={targetEventId}
                    onChange={(e) => setTargetEventId(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white font-medium ${errors.targetEventId ? 'border-red-300' : 'border-blue-100/80'
                      }`}
                  >
                    <option value="">-- Choose Active Event --</option>
                    {events.map(ev => (
                      <option key={ev._id} value={ev._id}>
                        {ev.title} ({new Date(ev.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  {errors.targetEventId && (
                    <p className="text-[10px] font-bold text-[#ef4444]">{errors.targetEventId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Field 3: Link Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Quick Templates Link (Optional)</label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateSelection(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-100 rounded-xl focus:outline-none focus:border-[#2189ed] bg-white text-blue-800 font-semibold"
              >
                <option value="">-- Pick Template to Autofill Message Body --</option>
                {templates.map(tpl => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.templateName} ({tpl.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Message Content</label>
              <textarea
                placeholder="Compose your SMS transmission..."
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm font-mono border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white resize-y leading-relaxed ${errors.messageBody ? 'border-red-300' : 'border-blue-100/80'
                  }`}
              />
              {errors.messageBody && (
                <p className="text-[10px] font-bold text-[#ef4444]">{errors.messageBody}</p>
              )}
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Variables: <code>{"{BuyerName}"}</code> tags are supported.</span>
                <span>Unicode characters limit segments to 70 letters.</span>
              </div>
            </div>

            {/* Scheduling segment */}
            <div className="border-t border-blue-100 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-[#2189ed]" />
                    <span>Schedule this Broadcast?</span>
                  </label>
                  <p className="text-[10px] text-gray-400">Launch immediate text blasts or queue cron-runner releases.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${isScheduled ? 'bg-[#2189ed]' : 'bg-slate-200'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${isScheduled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                </button>
              </div>

              {isScheduled ? (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-gray-700 block">Schedule Release Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white font-semibold ${errors.scheduledAt ? 'border-red-300' : 'border-blue-100/80'
                      }`}
                  />
                  {errors.scheduledAt && (
                    <p className="text-[10px] font-bold text-[#ef4444]">{errors.scheduledAt}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-xs bg-[#eef6ff] p-3 rounded-lg border border-blue-50 animate-fade-in">
                  <input
                    id="run-immediately-opt"
                    type="checkbox"
                    checked={runImmediately}
                    onChange={(e) => setRunImmediately(e.target.checked)}
                    className="h-4 w-4 text-[#2189ed] border-slate-300 rounded focus:ring-[#2189ed]"
                  />
                  <label htmlFor="run-immediately-opt" className="text-gray-800 font-semibold">
                    Broadcast immediately upon Saving
                  </label>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-blue-50 flex justify-end space-x-3 text-xs font-semibold">
              <button
                type="button"
                disabled={saving}
                onClick={onCancel}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#2189ed] hover:bg-[#1b74ca] text-white px-5 py-2.5 rounded-xl transition flex items-center space-x-1 shadow-sm disabled:opacity-75"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {isEditMode ? 'Update Campaign' : (isScheduled ? 'Schedule Out' : (runImmediately ? 'Broadcast Now' : 'Save draft'))}
                </span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Side: Preview Cards */}
        <div className="space-y-6">

          {/* Virtual Mobile Preview card */}
          <div className="bg-[#1f2937] p-4 pt-10 pb-6 rounded-3xl shadow-xl border-4 border-slate-800 relative select-none">
            {/* Top speaker notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-800 h-4 w-28 rounded-full flex items-center justify-center">
              <div className="bg-slate-900 w-2.5 h-2.5 rounded-full absolute left-4"></div>
              <div className="bg-slate-900 w-12 h-1 rounded-full"></div>
            </div>

            <div className="bg-slate-900 h-96 rounded-xl overflow-hidden flex flex-col justify-between p-3 flex-1 relative font-sans text-white">
              {/* Virtual OS Header */}
              <div className="flex justify-between items-baseline text-[9px] text-gray-400 font-semibold px-1">
                <span>04:12 PM</span>
                <span className="flex items-center space-x-1">
                  <span>5G</span>
                  <span>100%</span>
                </span>
              </div>

              {/* Chat screen */}
              <div className="flex-1 flex flex-col justify-end pb-3">
                <div className="space-y-2 max-w-[85%] self-start">
                  <div className="text-[9px] text-gray-500 font-bold ml-1.5 uppercase">
                    Ticketing Notification
                  </div>
                  <div className="bg-slate-800 text-white p-3 rounded-2xl rounded-tl-xs text-xs font-medium leading-relaxed font-mono whitespace-pre-wrap select-text selection:bg-[#2189ed]">
                    {messageBody ? messageBody.replace('{BuyerName}', 'Sarah') : 'Hi present ticket holder, this is Global Event Group... Your campaign content preview will render simulated variable replacements here!'}
                  </div>
                </div>
              </div>

              {/* Enter text line */}
              <div className="bg-slate-800 h-8 rounded-full flex items-center justify-between px-3 text-[10px] text-gray-500">
                <span>iMessage text</span>
                <Send className="h-3 w-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Core Quota remaining safety warn */}
          {quota && (
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-[#2189ed]" />
                <span>Plan Quota Security</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline text-gray-600">
                  <span>Available Balance:</span>
                  <span className="font-extrabold text-gray-800">{quota.smsRemaining} SMS</span>
                </div>
                <div className="flex justify-between items-baseline text-gray-600">
                  <span>Usage Limits:</span>
                  <span className="font-semibold">{quota.smsSent} / {quota.smsLimit} spent</span>
                </div>

                {quota.smsRemaining < 50 && (
                  <div className="bg-red-50 p-2.5 rounded border border-red-100 text-[10px] text-red-600 font-semibold flex items-start space-x-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p className="leading-normal">
                      Warning: Low credit. If targeted audience size exceeds available credits, the Campaign will fail. Upgrade plan quota.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
