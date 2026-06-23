import axios from "@/request/axiosReq";

const API_BASE = '/api/fbcampians/facebook';

// Create custom axios instance targeting the backend endpoints
const client = axios.create({
  baseURL: '/api/marketing/facebook',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach bearer token if present (for JWT Auth support)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('facebook_manager_token') || 'organizer_default';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const facebookApi = {
  // Connection and Setup Management
  getConnection: async () => {
    const res = await axios.get(`${API_BASE}/connection`);
    return res.data;
  },

  connectAccount: async (data) => {
    const res = await axios.post(`${API_BASE}/connect`,data);
    return res.data;
  },

  disconnectAccount: async () => {
   const res = await axios.get(`${API_BASE}/disconnect`);
    return res.data;
  },

  // Marketing metrics, lists and details
  getDashboard: async () => {
   const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  getCampaigns: async () => {
    const res = await axios.get(`${API_BASE}/campaigns`);
    return res.data;
  },

  getCampaignDetail: async (campaignId) => {
    const res = await axios.get(`${API_BASE}/campaign/${campaignId}`);
    return res.data;
  },

  getAdSets: async (campaignId) => {
    const res = await axios.get(`${API_BASE}/campaign/${campaignId}/adsets`);
    return res.data;
  },

  getAdsByAdSet: async (adsetId) => {
    const res = await axios.get(`${API_BASE}/adset/${adsetId}/ads`);
    return res.data;
  },

  getCampaignInsights: async (campaignId) => {
    const res = await axios.get(`${API_BASE}/campaign/${campaignId}/insights`);
    return res.data;
  },

  // Helper utility to update developer simulate modes
  setDemoToken: (token) => {
    if (token) {
      localStorage.setItem('facebook_manager_token', token);
    } else {
      localStorage.removeItem('facebook_manager_token');
    }
  }
};
