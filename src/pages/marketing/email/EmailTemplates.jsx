import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Copy, Trash2, Edit, Tag, Check, Filter } from 'lucide-react';
import { emailApi } from '../../../services/marketing/email/emailApi';

export default function EmailTemplates({ onAddNewTemplate, onEditTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  
  // Preview modal toggle
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [search, category, page]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await emailApi.getTemplates({
        search,
        category,
        page,
        limit: 8
      });
      if (res.success) {
        setTemplates(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.error || 'Failed to fetch templates.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred querying the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete template: "${name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      const res = await emailApi.deleteTemplate(id);
      if (res.success) {
        setTemplates(templates.filter(t => t._id !== id));
      } else {
        alert(res.error || 'Could not delete template.');
      }
    } catch (err) {
      alert(err.message || 'Failed connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setLoading(true);
      const res = await emailApi.duplicateTemplate(id);
      if (res.success) {
        alert('Template duplicated successfully.');
        fetchTemplates();
      } else {
        alert(res.error || 'Could not duplicate template.');
      }
    } catch (err) {
      alert(err.message || 'Error copying document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header action block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Email Design Templates</h2>
          <p className="text-xs text-slate-400 mt-1">Configure layout, markdown placeholders, and custom ticketing promotional items.</p>
        </div>
        <button 
          onClick={onAddNewTemplate}
          className="px-4 py-2.5 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Custom Template
        </button>
      </div>

      {/* Query Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search bar input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search templates by label or subject headers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800"
          />
        </div>

        {/* Categories selector */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select 
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2189ed] bg-white text-slate-800 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Information">Event Information</option>
            <option value="Promotion">Promotions</option>
            <option value="Invitation">Invitations</option>
            <option value="Survey">Post-Event Surveys</option>
          </select>
        </div>

      </div>

      {/* Primary loading display */}
      {loading && templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2189ed]"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium whitespace-nowrap">Gathering layouts...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white p-16 text-center border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center">
          <div className="p-4 bg-[#eef6ff] text-[#2189ed] rounded-full mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No Design Layouts Registered</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Design customizable blueprints containing dynamic content maps and ticketing passes.</p>
          <button 
            onClick={onAddNewTemplate}
            className="mt-6 px-4 py-2.5 bg-[#eef6ff] hover:bg-[#2189ed]/15 text-[#2189ed] text-xs font-bold rounded-lg transition"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <div key={tpl._id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs flex flex-col group hover:shadow-md transition duration-200">
              
              {/* Virtual micro layout thumbnail */}
              <div className="h-32 bg-slate-50 relative border-b border-slate-50 flex items-center justify-center overflow-hidden">
                {tpl.thumbnail ? (
                  <img src={tpl.thumbnail} alt={tpl.templateName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-100 rounded-md py-1 px-2 uppercase">
                      {tpl.category}
                    </span>
                  </div>
                )}
                
                {/* Visual categorizer pill overlay */}
                <span className="absolute top-2.5 right-2.5 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {tpl.category}
                </span>
              </div>

              {/* Layout properties body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm truncate" title={tpl.templateName}>
                    {tpl.templateName}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    Subject: {tpl.subject}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1 font-bold text-[10px] ${tpl.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" /> {tpl.status}
                  </span>
                  
                  {/* Visual action grid */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setPreviewTemplate(tpl)}
                      className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-lg transition"
                      title="Preview Template Markup"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(tpl._id)}
                      className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                      title="Duplicate Reference copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEditTemplate(tpl)}
                      className="p-1.5 hover:bg-[#eef6ff] text-[#2189ed] rounded-lg transition"
                      title="Modify Layout details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tpl._id, tpl.templateName)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                      title="Delete design blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Custom pagination counters */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold">Page {page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold rounded-lg transition"
            >
              Previous
            </button>
            <button 
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* HTML design renderer modal previewer */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Visual Preview: {previewTemplate.templateName}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Subject Heading: {previewTemplate.subject}</p>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Simulated mailing client workspace */}
            <div className="flex-1 bg-slate-100 p-6 overflow-y-auto min-h-[300px]">
              <div 
                className="bg-white border rounded-xl overflow-hidden shadow-xs p-4 mx-auto max-w-(--size-xs)"
                dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Close Preview
              </button>
              <button 
                onClick={() => { onEditTemplate(previewTemplate); setPreviewTemplate(null); }}
                className="px-4 py-2 bg-[#2189ed] hover:bg-[#1b74ca] text-white text-xs font-bold rounded-lg transition"
              >
                Edit Layout
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
