import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Eye, HelpCircle, Code, Layout } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailTemplateForm({ templateToEdit, onCancel, onSuccess }) {
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [category, setCategory] = useState('Promotion');
  const [status, setStatus] = useState('Active');
  const [thumbnail, setThumbnail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // edit vs preview

  useEffect(() => {
    if (templateToEdit) {
      setTemplateName(templateToEdit.templateName || '');
      setSubject(templateToEdit.subject || '');
      setHtmlContent(templateToEdit.htmlContent || '');
      setCategory(templateToEdit.category || 'Promotion');
      setStatus(templateToEdit.status || 'Active');
      setThumbnail(templateToEdit.thumbnail || '');
    } else {
      // Default placeholder boilerplate to help user begin editing immediately
      setHtmlContent(`
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eef6ff; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #1f2937; margin-bottom: 8px;">Exclusive Event Invitation! ⚡</h2>
  <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Hello VIP buyer,</p>
  <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">We have curated a premier networking forum as part of our upcoming event series. Claim your passes right away!</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="#" style="background-color: #2189ed; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Secure Event Seat</a>
  </div>
  
  <p style="font-size: 11px; text-align: center; color: #9ca3af; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 15px;">
    Sent to you by EventHub Ticketing. You received this because you purchased tickets recently.
  </p>
</div>
      `);
    }
  }, [templateToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!templateName.trim() || !subject.trim() || !htmlContent.trim()) {
      setError('Template Name, Subject, and HTML Content are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        templateName,
        subject,
        htmlContent,
        category,
        status,
        thumbnail: thumbnail || ''
      };

      let res;
      if (templateToEdit) {
        res = await emailApi.updateTemplate(templateToEdit._id, payload);
      } else {
        res = await emailApi.createTemplate(payload);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to persist template model.');
      }
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || err.message || 'Error occurred communicating with the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header back button ribbon */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {templateToEdit ? `Edit Template: ${templateToEdit.templateName}` : 'Create New Design Template'}
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
            {templateToEdit ? 'Save edits' : 'Author new responsive layouts'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Param setting sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b">Template Properties</h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg">
                ❌ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Template Name *
              </label>
              <input 
                type="text"
                placeholder="e.g., Early Bird Retargeting"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Email Subject Heading *
              </label>
              <input 
                type="text"
                placeholder="e.g., Claim Your seats! 🚀 VIP tickets inside"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Category
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
                >
                  <option value="Information">Information</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Invitation">Invitation</option>
                  <option value="Survey">Feedback Survey</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Status
                </label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Cover Photo Thumbnail URL (optional)
              </label>
              <input 
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-[#2189ed] hover:bg-[#1b74ca] text-white disabled:opacity-55 text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Layout'}
              </button>
            </div>

          </div>

          <div className="bg-[#eef6ff] p-4 rounded-xl border border-[#2189ed]/10 text-slate-600 text-xs leading-relaxed space-y-2">
            <h4 className="font-bold text-[#2189ed] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Layout Instructions
            </h4>
            <p>Use standard inline CSS markup properties so that the template renders beautifully in Outlook, Gmail, and iOS Mail clients.</p>
            <p className="font-semibold text-[#1b74ca]">Required Placeholders:</p>
            <ul className="list-disc leading-loose pl-4 font-mono text-[10px]">
              <li>Use standard custom anchor tags for pass download URLs</li>
              <li>Include your business physical footer details</li>
            </ul>
          </div>
        </div>

        {/* Real-time HTML Editor & interactive splitting preview */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[450px]">
          
          {/* Header switch toggler */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Code className="w-4 h-4 text-[#2189ed]" /> Email HTML Editor Workspace
            </span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button 
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${activeTab === 'edit' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                <Code className="w-3.5 h-3.5" /> Source
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${activeTab === 'preview' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview Screen
              </button>
            </div>
          </div>

          {/* Canvas frames */}
          <div className="flex-1 flex flex-col p-4 bg-slate-50 min-h-[400px]">
            {activeTab === 'edit' ? (
              <textarea 
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Enter rich email HTML layout structure here..."
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
