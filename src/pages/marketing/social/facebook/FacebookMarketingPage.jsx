import React, { useState, useEffect } from 'react';
import { Facebook, ShieldAlert, Sparkles, CheckCircle2, Ticket, ChevronRight, Layout, Settings, Target, Users, Megaphone, BarChart3, Rocket, RefreshCw, RocketIcon, RefreshCcw } from 'lucide-react';
import FacebookConnection from '@/components/marketing/social/facebook/FacebookConnection.jsx';
import FacebookCampaignPage from './FacebookCampaignPage.jsx';
import CampaignEventSelector from '@/components/marketing/social/facebook/CampaignEventSelector.jsx';
import EventBannerUploader from '@/components/marketing/social/facebook/EventBannerUploader.jsx';
import AudienceBuilder from '@/components/marketing/social/facebook/AudienceBuilder.jsx';
import FacebookAdSetPage from './FacebookAdSetPage.jsx';
import FacebookAdPage from './FacebookAdPage.jsx';
import FacebookInsightsDashboard from './FacebookInsightsDashboard.jsx';
import FacebookApiService from '@/services/marketing/social/facebook/FacebookApiService.js';

export default function FacebookMarketingPage() {
  const [activeStep, setActiveStep] = useState('connect'); // connect, campaign, audience, deploy, insights

  // Pipeline global tracking states
  const [connection, setConnection] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeCreative, setActiveCreative] = useState(null);
  const [activeAudience, setActiveAudience] = useState(null);
  const [activeAdSet, setActiveAdSet] = useState(null);
  const [activeAd, setActiveAd] = useState(null);

  // Status flags
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync state validation
  const isFacebookConnected = !!connection;
  const isCampaignConfigured = !!activeCampaign;
  const isEventConfigured = !!activeEvent;
  const isCreativeConfigured = !!activeCreative;
  const isAudienceConfigured = !!activeAudience;
  const isAdSetConfigured = !!activeAdSet;
  const isAdConfigured = !!activeAd;

  // Track ticket sales test event
  const handlePublish = async () => {
    if (!activeCampaign) {
      setErrorMessage('Deploy Validations Failed: No campaign structured yet.');
      return;
    }

    setPublishing(true);
    setErrorMessage(null);
    setPublishMessage(null);

    try {
      const res = await FacebookApiService.publishCampaign(activeCampaign._id);
      setPublishMessage(res.message || 'Entire marketing pipeline published successfully on Meta Graph catalog.');

      // Update dynamic campaign state
      setActiveCampaign({
        ...activeCampaign,
        status: 'ACTIVE'
      });

      // Jump straight to analytics reporting
      setTimeout(() => {
        setActiveStep('insights');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to trigger campaign cascade publishing.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

      {/* SaaS Primary Top Navigation Box with Slate Premium traits */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-2">
          <div className="flex items-center gap-3">

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Create Facebook Ads</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-105">EVENT ADS</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Meta Ad Manager &bull; Premium Business Console</p>
            </div>
          </div>

          {/* Stepper Roadmap Segmented Tabs Box with Active background state */}
          <div className="flex flex-wrap gap-1 bg-slate-100/85 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'connect', label: '1. Connect Meta', valid: isFacebookConnected },
              { id: 'campaign', label: '2. Campaign & Creative', valid: isCampaignConfigured && isCreativeConfigured },
              { id: 'audience', label: '3. Addset & Target Audience', valid: isAudienceConfigured && isAdSetConfigured },
              { id: 'deploy', label: '4. Initialize & Publish Ad', valid: isAdConfigured }

            ].map((st) => {
              const isActive = activeStep === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStep(st.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-2 ${isActive
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                    }`}
                >
                  {st.valid ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0"></span>
                  )}
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Core Body Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-6">
        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 leading-tight">Connected Campaign - {activeCampaign?._id || 'Campaign Not Selected'} </h4>
            <p className="text-xs text-blue-700/80 mt-0.5">Ad Sets are created inside the selected Facebook Campaign.</p>
          </div>
        </div>



        {/* Dynamic active view render segment */}
        <div className="flex-1 flex flex-col gap-6">

          {activeStep === 'connect' && (
            <FacebookConnection onConnectionChange={setConnection} />
          )}

          {activeStep === 'campaign' && (
            <>
              {!isFacebookConnected && (
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
                  <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 leading-tight">Meta Connection Is Empty</h4>
                    <p className="text-xs text-blue-700/80 mt-0.5">Please map a Facebook OAuth credentials profile under Step 1 before configuring campaigns.</p>
                  </div>
                </div>
              )}

              {/* Campaign Creator page Component */}
              <FacebookCampaignPage
                onCampaignCreated={(camp) => {
                  setActiveCampaign(camp);
                  // Auto fill campaign name in form triggers
                }}
                activeCampaignId={activeCampaign?._id}
              />

              {/* Event selectors and visual creative uploaders */}
              {isCampaignConfigured && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                  {/* Step 3: Event selector */}
                  <CampaignEventSelector
                    campaignId={activeCampaign?._id}
                    activeEventId={activeEvent?._id}
                    onEventSelected={(evt) => {
                      setActiveEvent(evt);
                    }}
                  />

                  {/* Step 4: Event creative banner uploader */}
                  {isEventConfigured ? (
                    <EventBannerUploader
                      campaignId={activeCampaign?._id}
                      eventId={activeEvent?._id}
                      defaultBanner={activeEvent?.banners?.[0].square}
                      onCreativeSaved={(crt) => {
                        setActiveCreative(crt);
                      }}
                    />
                  ) : (
                    <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                      <ChevronRight className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-gray-700">Prerequisite Event Mapping</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Choose an active Happlynex event to open the creative banner custom designer form.</p>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

          {activeStep === 'audience' && (
            <>
              {!isCampaignConfigured && (
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
                  <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 leading-tight">Campaign Blueprint Missing</h4>
                    <p className="text-xs text-blue-700/80 mt-0.5">Setup a Facebook Campaign record under Step 2 before mapping target audiencies or adsets.</p>
                  </div>
                </div>
              )}



              {/* Step 6: Ad set spec creator */}
              {isCampaignConfigured && (
                <FacebookAdSetPage
                  campaignId={activeCampaign?._id}
                  audienceId={activeAudience?._id}
                  defaultBudget={activeCampaign?.budget}
                  onAdSetCreated={(set) => {
                    setActiveAdSet(set);
                  }}
                />
              )}
            </>
          )}

          {activeStep === 'deploy' && (
            <>


              {/* Step 7: Final Ad creator form */}
              {isCampaignConfigured && !isAdConfigured && (
                <div className="flex flex-col gap-6">
                  <FacebookAdPage
                    campaignId={activeCampaign?._id}
                    adSetId={activeAdSet?._id}
                    creativeId={activeCreative?._id}
                    onAdCreated={(ad) => {
                      setActiveAd(ad);
                    }}
                  />

                  {/* Step 8: Cascade publisher deploy panel */}
                  {isAdConfigured && (
                    <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                          <Rocket className="w-5 h-5 text-blue-600" />
                          Ready to Publish on Meta!
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Our cascade check passed. This will activate your Campaign, Ad Set, and Ad simultaneously in Meta Ad Manager.
                        </p>
                      </div>

                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
                      >
                        {publishing ? (
                          <>
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                            Activating Campaign Cascade...
                          </>
                        ) : (
                          <>
                            <RocketIcon className="w-4 h-4" />
                            Publish Campaign Cascade
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-700 rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  {publishMessage && (
                    <div className="p-3 bg-green-50 border border-green-100 text-xs text-green-700 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {publishMessage}
                    </div>
                  )}
                </div>
              )}
            </>
          )}



        </div>

      </main>



    </div>
  );
}
