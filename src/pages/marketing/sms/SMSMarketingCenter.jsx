import React, { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  BarChart3,
  CreditCard,
  Settings
} from 'lucide-react';

import SMSDashboard from './SMSDashboard';
import SMSCampaigns from './SMSCampaigns';
import SMSCampaignForm from './SMSCampaignForm';
import SMSTemplates from './SMSTemplates';
import SMSTemplateForm from './SMSTemplateForm';
import SMSAnalytics from './SMSAnalytics';
import SMSMarketingPlans from './SMSMarketingPlans';
import SMSSettings from './SMSSettings';

export default function SMSMarketingCenter() {

  const [activeTab, setActiveTab] = useState('dashboard');

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Megaphone
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'plans',
      label: 'Plans',
      icon: CreditCard
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          SMS Marketing Center
        </h1>

        <p className="text-sm text-slate-500">
          Manage SMS campaigns, templates, analytics and plans.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border p-2">
        <div className="flex flex-wrap gap-2">

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition
                  ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}

        </div>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <SMSDashboard />
      )}

      {/* Campaigns */}
      {activeTab === 'campaigns' && (
        <SMSCampaigns
          onAddNew={() => {
            setSelectedCampaign(null);
            setActiveTab('campaign-form');
          }}
          onEdit={(campaign) => {
            setSelectedCampaign(campaign);
            setActiveTab('campaign-form');
          }}
        />
      )}

      {/* Campaign Form */}
      {activeTab === 'campaign-form' && (
        <SMSCampaignForm
          campaignToEdit={selectedCampaign}
          onCancel={() => setActiveTab('campaigns')}
          onSuccess={() => setActiveTab('campaigns')}
        />
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <SMSTemplates
          onAddNew={() => {
            setSelectedTemplate(null);
            setActiveTab('template-form');
          }}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setActiveTab('template-form');
          }}
        />
      )}

      {/* Template Form */}
      {activeTab === 'template-form' && (
        <SMSTemplateForm
          templateToEdit={selectedTemplate}
          onCancel={() => setActiveTab('templates')}
          onSuccess={() => setActiveTab('templates')}
        />
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <SMSAnalytics />
      )}

      {/* Plans */}
      {activeTab === 'plans' && (
        <SMSMarketingPlans />
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <SMSSettings />
      )}

    </div>
  );
}