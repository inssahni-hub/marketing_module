import React, { useState } from 'react';
import {
  BarChart3,
  Mail,
  Layers,
  Users,
  LineChart,
  Calendar,
  Settings
} from 'lucide-react';

// Pages
import EmailDashboard from './EmailDashboard';
import EmailCampaigns from './EmailCampaigns';
import EmailCampaignForm from './EmailCampaignForm';
import EmailTemplates from './EmailTemplates';
import EmailTemplateForm from './EmailTemplateForm';
import EmailAnalytics from './EmailAnalytics';
import MarketingPlans from './MarketingPlans';
import EmailSettings from './EmailSettings';
import EmailAudience from './EmailAudience';

export default function EmailMarketingCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAnalyticsCampaign, setSelectedAnalyticsCampaign] = useState(null);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 size={16} />
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: <Mail size={16} />
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <Layers size={16} />
    },
    {
      id: 'audience',
      label: 'Audience',
      icon: <Users size={16} />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <LineChart size={16} />
    },
    {
      id: 'plans',
      label: 'Plans',
      icon: <Calendar size={16} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />
    }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Email Marketing Center
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Create campaigns, manage templates, audiences and analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2
                px-4 py-2 rounded-lg text-sm font-semibold
                transition
                ${
                  activeTab === tab.id
                    ? 'bg-[#2189ed] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}

      {activeTab === 'dashboard' && (
        <EmailDashboard
          onViewChange={setActiveTab}
          onEditCampaign={(campaign) => {
            setSelectedCampaign(campaign);
            setActiveTab('campaign-form');
          }}
          onSelectCampaignAnalytics={(campaignId) => {
            setSelectedAnalyticsCampaign(campaignId);
            setActiveTab('analytics');
          }}
        />
      )}

      {activeTab === 'campaigns' && (
        <EmailCampaigns
          onAddNewCampaign={() => {
            setSelectedCampaign(null);
            setActiveTab('campaign-form');
          }}
          onEditCampaign={(campaign) => {
            setSelectedCampaign(campaign);
            setActiveTab('campaign-form');
          }}
          onSelectAnalytics={(campaignId) => {
            setSelectedAnalyticsCampaign(campaignId);
            setActiveTab('analytics');
          }}
        />
      )}

      {activeTab === 'campaign-form' && (
        <EmailCampaignForm
          campaignToEdit={selectedCampaign}
          onCancel={() => setActiveTab('campaigns')}
          onSuccess={() => setActiveTab('campaigns')}
        />
      )}

      {activeTab === 'templates' && (
        <EmailTemplates
          onAddNewTemplate={() => {
            setSelectedTemplate(null);
            setActiveTab('template-form');
          }}
          onEditTemplate={(template) => {
            setSelectedTemplate(template);
            setActiveTab('template-form');
          }}
        />
      )}

      {activeTab === 'template-form' && (
        <EmailTemplateForm
          templateToEdit={selectedTemplate}
          onCancel={() => setActiveTab('templates')}
          onSuccess={() => setActiveTab('templates')}
        />
      )}

      {activeTab === 'audience' && (
        <EmailAudience />
      )}

      {activeTab === 'analytics' && (
        <EmailAnalytics
          campaignId={selectedAnalyticsCampaign}
          onBack={() => setActiveTab('campaigns')}
        />
      )}

      {activeTab === 'plans' && (
        <MarketingPlans />
      )}

      {activeTab === 'settings' && (
        <EmailSettings />
      )}

    </div>
  );
}