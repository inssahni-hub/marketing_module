import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, Image, AlertCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';
import FacebookApiService from '../../../../services/marketing/social/facebook/FacebookApiService.js';

export default function EventBannerUploader({ campaignId, eventId, defaultBanner, onCreativeSaved }) {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [callToAction, setCallToAction] = useState('BOOK_NOW');
  const [bannerPreview, setBannerPreview] = useState(defaultBanner || 'https://picsum.photos/seed/defaultAd/800/450');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fileInputRef = useRef(null);

  // Sync state if defaultBanner or campaignId changes
  useEffect(() => {
    if (defaultBanner) {
      setBannerPreview(defaultBanner);
    }
    const loadSavedCreative = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const creative = await FacebookApiService.getCreative(campaignId);
        if (creative) {
          setHeadline(creative.headline || '');
          setDescription(creative.description || '');
          setLandingPageUrl(creative.landingPageUrl || '');
          setCallToAction(creative.callToAction || 'BOOK_NOW');
          setBannerPreview(creative.bannerImage || defaultBanner);
        }
      } catch (err) {
        console.warn('No cached creative assets loaded', err);
      } finally {
        setLoading(false);
      }
    };
    loadSavedCreative();
  }, [campaignId, defaultBanner]);

  const handleFileChange = (e) => {
    setErrorMsg(null);
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file types.');
        return;
      }
      setSelectedFile(file);
      // Create local blob preview
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please drop a valid image file.');
        return;
      }
      setSelectedFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteBanner = () => {
    setSelectedFile(null);
    setBannerPreview(defaultBanner || 'https://picsum.photos/seed/defaultAd/800/450');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignId || !eventId) {
      setErrorMsg('Ensure a Campaign and Event are selected before compiling ad creative banners.');
      return;
    }
    if (!headline || !description) {
      setErrorMsg('Ad copy Headline and Description text are mandatory.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('campaignId', campaignId);
      formData.append('eventId', eventId);
      formData.append('headline', headline);
      formData.append('description', description);
      formData.append('landingPageUrl', landingPageUrl || `https://happnex.com/events/${eventId}`);
      formData.append('callToAction', callToAction);

      if (selectedFile) {
        formData.append('banner', selectedFile);
      } else {
        formData.append('bannerImage', bannerPreview);
      }

      const res = await FacebookApiService.createCreative(formData);
      setSuccessMsg('Facebook campaign Ad Creative successfully compiled and cached!');
      
      if (onCreativeSaved) {
        onCreativeSaved(res.creative);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Creative compilation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Image className="w-5.5 h-5.5 text-blue-600" />
          Creative Media Designer
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload promotion imagery, customize targeted title headers, and inspect real-time mock rendering before launching.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-emerald-800">
          <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-450 mt-2 font-medium">Acquiring cached drafts...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ad Customization Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-4.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Headline Hook</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Get 20% Off Wave Concert Tickets!"
                  className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">CTA Call to Action</label>
                <select
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none cursor-pointer transition-all text-slate-800"
                >
                  <option value="BOOK_NOW">Book Now (Recommended)</option>
                  <option value="BUY_TICKETS">Buy Tickets</option>
                  <option value="GET_SHOWTIMES">Get Showtimes</option>
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="REGISTER_NOW">Register Now</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Primary Feed Description Text</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Experience the summer waves concert with world-class techno line-ups. Secure early-bird tickets now!"
                rows={3}
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none resize-none transition-all text-slate-900 placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Destination Ticket Landing Page</label>
              <input
                type="url"
                value={landingPageUrl}
                onChange={(e) => setLandingPageUrl(e.target.value)}
                placeholder="e.g., https://happnex.com/events/summer-wave"
                className="w-full text-xs font-medium border border-slate-250 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/30 bg-slate-50 focus:bg-white px-4 py-3 rounded-lg outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div className='hidden'>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-2">Ad Banner Imagery</label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-white px-5 py-7 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
              >
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-450 shadow-xs mb-3 group-hover:scale-105 duration-300">
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Drag or drop custom image banner here</span>
                <span className="text-[10px] text-slate-450 mt-1">JPEG, PNG or SVG. Max file size: 5MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {selectedFile && (
                <div className="mt-3 p-2 px-3 bg-blue-50/50 rounded-lg flex items-center justify-between border border-blue-100 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-medium text-blue-800 truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteBanner}
                    className="p-1 hover:bg-blue-100/70 text-blue-700 rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Compiling Creative...
                </>
              ) : (
                'Save Creative Assets'
              )}
            </button>
          </form>

          {/* Facebook Mock Feed Preview Layout */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="sticky top-24">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                Live Facebook Mobile Feed Preview
              </span>
              
              <div className="bg-white rounded-xl border border-slate-205 overflow-hidden shadow-xs max-w-sm mx-auto">
                {/* Header Mock */}
                <div className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    H
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      Happnex Sponsor
                      <span className="bg-blue-50 text-blue-600 text-[8px] font-bold px-1 py-0.2 rounded border border-blue-100 uppercase">AD</span>
                    </h5>
                    <p className="text-[10px] text-slate-450 mt-0.5">Sponsored &bull; Conversion Enabled</p>
                  </div>
                </div>

                {/* Primary Description Copy */}
                <div className="px-3.5 pb-3">
                  <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                    {description || 'Your promotional ad description will automatically flow here to hook target ticket buyers.'}
                  </p>
                </div>

                {/* Main Visual Image Banner */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-y border-slate-200">
                  <img
                    src={bannerPreview}
                    alt="Creative Ad Banner preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/75 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Happnex Exclusive
                  </div>
                </div>

                {/* Visual Metadata Footer Box */}
                <div className="p-3.5 bg-slate-50 flex items-center justify-between gap-3 border-t border-slate-100">
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase font-mono tracking-widest truncate">
                      {landingPageUrl ? new URL(landingPageUrl).hostname : 'HAPPNEX.COM'}
                    </p>
                    <h6 className="text-xs font-semibold text-slate-900 truncate mt-1 leading-tight">
                      {headline || 'Limited Booking Open'}
                    </h6>
                  </div>
                  <span className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 text-[9px] font-semibold rounded border border-slate-200 shrink-0 transition-all uppercase">
                    {callToAction.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
