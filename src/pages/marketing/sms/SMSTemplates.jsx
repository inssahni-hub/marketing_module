import React, { useState, useEffect } from 'react';
import { smsApiService } from '../../../services/marketing/sms/smsApiService.js';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Copy,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import SMSTemplateForm from './SMSTemplateForm.jsx';

export default function SMSTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [notify, setNotify] = useState(null);

  // Deletion Dialog State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await smsApiService.getTemplates({
        page,
        limit: 8,
        search,
        category
      });
      if (res.success) {
        setTemplates(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to connect and query database templates.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, category]); // fetch automatically when page or category changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTemplates();
  };

  const triggerNotification = (text, type = 'success') => {
    setNotify({ text, type });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleDuplicate = async (id) => {
    try {
      setActionLoading(id);
      const res = await smsApiService.duplicateTemplate(id);
      if (res.success) {
        triggerNotification('Template duplicated successfully!');
        fetchTemplates();
      } else {
        triggerNotification(res.error || 'Failed to duplicate template', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to duplicate record on the database.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(id);
      const res = await smsApiService.deleteTemplate(id);
      if (res.success) {
        triggerNotification('Template deleted permanently.', 'warning');
        setConfirmDeleteId(null);
        fetchTemplates();
      } else {
        triggerNotification(res.error || 'Failed to delete template', 'danger');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to complete delete request.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in">

      {/* Notifications bar */}
      {notify && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center space-x-2 animate-bounce ${notify.type === 'danger' ? 'bg-red-50 text-[#ef4444] border-red-100' :
          notify.type === 'warning' ? 'bg-amber-50 text-[#f59e0b] border-amber-100' :
            'bg-emerald-50 text-[#22c55e] border-emerald-100'
          }`}>
          <span>{notify.text}</span>
        </div>
      )}

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">SMS Templates</h1>
          <p className="text-xs text-gray-500">Draft rich quick-message templates for instantaneous marketing broadcasts.</p>
        </div>
        <a
          onClick={() => {
            setSelectedTemplate(null);
            setShowTemplateModal(true);
          }}
          className="bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 self-start shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Template</span>
        </a>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search template name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-slate-50/50"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </form>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <Filter className="h-4 w-4" />
            <span>Category:</span>
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:border-[#2189ed] font-medium"
          >
            <option value="">All Categories</option>
            <option value="Reminder">Reminders</option>
            <option value="Update">Updates</option>
            <option value="Venue Change">Venue Changes</option>
            <option value="Emergency">Emergency</option>
            <option value="Promo">Promo</option>
            <option value="Discount">Discounts</option>
            <option value="VIP">VIP</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <RefreshCw className="h-8 w-8 text-[#2189ed] animate-spin" />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Querying stored templates...</p>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="bg-white border border-blue-100 hover:border-[#2189ed]/30 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden relative"
            >
              {/* Template Category Tag */}
              <div className="p-4 border-b border-blue-50 flex justify-between items-center bg-[#2189ed]/5">
                <span className="text-[10px] font-bold text-[#2189ed] uppercase tracking-wider bg-[#eef6ff] px-2 py-0.5 rounded-full">
                  {tpl.category}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(tpl.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Template Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1" title={tpl.templateName}>
                    {tpl.templateName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-4 mt-2 leading-relaxed font-mono">
                    {tpl.messageBody}
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-gray-400">
                  Length: <span className="text-gray-600">{tpl.messageBody.length} chars</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-3 bg-[#2189ed]/5 border-t border-blue-50 flex justify-end space-x-2.5">
                <button
                  onClick={() => handleDuplicate(tpl._id)}
                  disabled={actionLoading === tpl._id}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition hover:bg-slate-100 rounded"
                  title="Duplicate Template"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  // href={`#/templates/edit/${tpl._id}`}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setShowTemplateModal(true);
                  }}
                  className="p-1.5 text-[#2189ed] hover:text-[#1b74ca] transition hover:bg-slate-100 rounded"
                  title="Edit Template"
                >
                  <Edit className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setConfirmDeleteId(tpl._id)}
                  className="p-1.5 text-red-400 hover:text-[#ef4444] transition hover:bg-red-50 rounded"
                  title="Delete Template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* In-place Delete Confirm overlay */}
              {confirmDeleteId === tpl._id && (
                <div className="absolute inset-0 bg-white/95 p-4 flex flex-col items-center justify-center text-center space-y-3 z-10 transition-all">
                  <AlertTriangle className="h-8 w-8 text-[#ef4444]" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Confirm Deletion</h4>
                    <p className="text-[10px] text-gray-500 mt-1 px-4 leading-normal">
                      Are you sure you want to remove template "{tpl.templateName}" permanently?
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(tpl._id)}
                      className="bg-[#ef4444] hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-xl border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-gray-700">No Templates Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {search || category ? 'No filters match. Try clearing filters or searching for something else.' : 'Get started by drafting your first SMS outreach message template.'}
            </p>
          </div>
          {(search || category) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setPage(1);
              }}
              className="mt-2 text-xs font-bold text-[#2189ed] underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 disabled:opacity-50 disabled:hover:bg-white transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
    {
    showTemplateModal && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
        }}
      >
        <div
          className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {selectedTemplate
                  ? 'Edit Template'
                  : 'Create SMS Template'}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Configure audience, message template and delivery settings.
              </p>
            </div>

            <button
              onClick={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
              }}
              className="h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>

          </div>

          {/* Body */}
          <div className="max-h-[85vh] overflow-y-auto">

            <SMSTemplateForm
              templateToEdit={selectedTemplate}
              onCancel={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
              }}
              onSuccess={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);

                fetchTemplates();
              }}
            />

          </div>

        </div>
      </div>
    )
  }
  </>
  );
}
