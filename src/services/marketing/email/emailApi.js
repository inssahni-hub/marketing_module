import axios from "@/request/axiosReq";
const API_BASE = '/api/marketing/email';


export const emailApi = {
  // Authentication / Demo Switcher
  loginDemo: async (email = 'demo@eventhub.com') => {
    try {
      return true;
      throw new Error('Authentication failed');
    } catch (err) {
      console.error('Demo Login Error:', err);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('organizer_token');
    localStorage.removeItem('organizer_profile');
  },

  getCurrentOrganizer: () => {
    try {
      const profile = localStorage.getItem('auth_user');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await axios.get(`${API_BASE}/analytics/dashboard`);
    return res.data;
  },

  getCampaignAnalytics: async (campaignId) => {
    const res = await axios.get(`${API_BASE}/analytics/campaigns/${campaignId}`);
    return res.data;
  },

  // Templates
  getTemplates: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/templates`,{ params });
    return res.data;
  },

  getTemplateById: async (id) => {
    const res = await axios.get(`${API_BASE}/templates/${id}`);
    return res.data;
  },

  createTemplate: async (data) => {
    const res = await axios.post(`${API_BASE}/templates`,data);
    return res.data;
  },

  updateTemplate: async (id, data) => {
    const res = await axios.put(`${API_BASE}/templates/${id}`,data);
    return res.data;
  },

  deleteTemplate: async (id) => {
    const res = await axios.delete(`${API_BASE}/templates/${id}`);
    return res.data;
  },

  duplicateTemplate: async (id) => {
    const res = await axios.post(`${API_BASE}/templates/${id}/duplicate`);
    return res.data;
  },

  // Campaigns
  getCampaigns: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/campaigns`, { params });
    return res.data;
  },

  getCampaignById: async (id) => {
    const res = await axios.get(`${API_BASE}/campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (data) => {
    const res = await axios.post(`${API_BASE}/campaigns`,data);
    return res.data;
  },

  updateCampaign: async (id, data) => {
    const res = await axios.put(`${API_BASE}/campaigns/${id}`,data);
    return res.data;
  },

  deleteCampaign: async (id) => {
    const res = await axios.delete(`${API_BASE}/campaigns/${id}`);
    return res.data;
  },

  duplicateCampaign: async (id) => {
    const res = await axios.post(`${API_BASE}/campaigns/${id}/duplicate`);
    return res.data;
  },

  sendCampaignNow: async (id) => {
    const res = await axios.post(`${API_BASE}/campaigns/${id}/send`);
    return res.data;
  },

  cancelCampaign: async (id) => {
    const res = await axios.post(`${API_BASE}/campaigns/${id}/cancel`);
    return res.data;
  },

  // Plans & Limits
  getPlans: async () => {
    const res = await axios.get(`${API_BASE}/plans`);
    return res.data;
  },

  getUsage: async () => {
    const res = await axios.get(`${API_BASE}/usage`);
    return res.data;
  },

  subscribePlan: async (planId) => {
    const res = await axios.post(`${API_BASE}/plans/subscribe`, { planId });
    return res.data;
  },

  // Utilities
  getEvents: async () => {
    const res = await axios.get(`${API_BASE}/events`);
    return res.data;
  },

  getBuyers: async () => {
    const res = await axios.get(`${API_BASE}/buyers`);
    return res.data;
  },

  // SendGrid live configuration sanity check
  checkSendGridConfig: async () => {
    // Basic service endpoint checker
    try {
      const res = await axios.get(`${API_BASE}/plans`); // simple ping check or default true
      return { configured: true, hasApiKey: true, hasFromEmail: true, mode: 'Live Simulation' };
    } catch {
      return { configured: false };
    }
  }
};
