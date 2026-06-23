import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import { ArrowLeft, Save, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function SMSTemplateForm({
  templateToEdit = null,
  onCancel,
  onSuccess
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [category, setCategory] = useState('General');
  const [errorHeader, setErrorHeader] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const loadTemplate = async () => {
        try {
          const res = await smsApiService.getTemplateById(id);
          if (res.success) {
            setTemplateName(res.data.templateName);
            setMessageBody(res.data.messageBody);
            setCategory(res.data.category || 'General');
          } else {
            setErrorHeader('Template record could not be fetched from the database.');
          }
        } catch (err) {
          console.error(err);
          setErrorHeader('Failed to establish API communication for record details.');
        } finally {
          setLoading(false);
        }
      };
      loadTemplate();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setErrorHeader('');

    // Pre-validations client-side
    const clientErrors = {};
    if (!templateName.trim()) {
      clientErrors.templateName = 'Template name is required';
    }
    if (!messageBody.trim()) {
      clientErrors.messageBody = 'Message body is required';
    } else if (messageBody.length > 1600) {
      clientErrors.messageBody = 'Twilio SMS body length cannot exceed 1600 characters';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setSaving(false);
      return;
    }

    try {
      const payload = { templateName, messageBody, category };
      let res;
      if (isEditMode) {
        res = await smsApiService.updateTemplate(id, payload);
      } else {
        res = await smsApiService.createTemplate(payload);
      }

      if (res.success) {
        onSuccess?.();
      } else {
        if (res.errors) {
          setErrors(res.errors);
        } else {
          setErrorHeader(res.error || 'Failed to save template record.');
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrorHeader('Backend validation exception or communication failure.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
        <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Loading template details...</p>
      </div>
    );
  }

  // Calculate Twilio sms segment count estimate (Standard GSM-7 character length per SMS is 160, or 153 for multi-part concatenated SMS)
  const isUnicode = /[^\u0000-\u007F]/.test(messageBody);
  const segmentLimit = isUnicode ? 70 : 160;
  const multiPartLimit = isUnicode ? 67 : 153;
  
  let segmentCount = 1;
  if (messageBody.length > segmentLimit) {
    segmentCount = Math.ceil(messageBody.length / multiPartLimit);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
     

      <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="p-6 border-b border-blue-50 bg-blue-50/20">
          <h1 className="text-lg font-bold text-gray-800">
            {isEditMode ? 'Edit SMS Template' : 'Create SMS Template'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure automated tokenization structures for buyer messages.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorHeader && (
          <div className="m-6 mb-0 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-[#ef4444] font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorHeader}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Template Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Template Name</label>
            <input 
              type="text"
              placeholder="e.g., Emergency Venue Change Warning"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={`w-full px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white ${
                errors.templateName ? 'border-red-300 bg-red-50/10' : 'border-blue-100/80'
              }`}
            />
            {errors.templateName && (
              <p className="text-[10px] font-bold text-[#ef4444]">{errors.templateName}</p>
            )}
          </div>

          {/* 2. Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Category Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-blue-100/80 rounded-xl focus:outline-none focus:border-[#2189ed] bg-white font-medium"
            >
              <option value="Reminder">Reminder (Event starts / timing alarms)</option>
              <option value="Update">Update (General ticket announcements)</option>
              <option value="Venue Change">Venue Change (Site locations adjustments)</option>
              <option value="Emergency">Emergency (Immediate danger / actions needed)</option>
              <option value="Promo">Promo (Advertising releases)</option>
              <option value="Discount">Discount (Ticketing coupon unlocks)</option>
              <option value="VIP">VIP (High-tier client perks notifications)</option>
              <option value="General">General (Generic notification template)</option>
            </select>
          </div>

          {/* 3. Message Body */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-gray-700 block">Message Body</label>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                SMS Segment count: <span className="text-slate-700 font-extrabold">{segmentCount}</span> ({messageBody.length} / {segmentLimit} chars size)
              </span>
            </div>
            <textarea
              placeholder="Hi present ticket holder, this is Global Event Group. We wanted to inform you that our Summer Sonic concert gate entrance has opened at 04:00 PM today. See you soon!"
              rows={6}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className={`w-full px-4 py-3 text-sm font-mono border rounded-xl focus:outline-none focus:border-[#2189ed] bg-white resize-y leading-relaxed ${
                errors.messageBody ? 'border-red-300 bg-red-50/10' : 'border-blue-100/80'
              }`}
            />
            {errors.messageBody ? (
              <p className="text-[10px] font-bold text-[#ef4444]">{errors.messageBody}</p>
            ) : (
              <div className="bg-[#eef6ff] p-3 rounded-lg border border-blue-50 text-[10px] text-gray-600 flex items-start space-x-1.5 leading-normal">
                <Info className="h-4 w-4 text-[#2189ed] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Tip:</strong> Keep messages concise. Messages exceeding 160 characters are automatically split and charged as concatenated segments. Avoid emoji icons to save character space.
                </p>
              </div>
            )}
          </div>

          {/* Submit and Cancel items */}
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
              <span>{isEditMode ? 'Update Template' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
