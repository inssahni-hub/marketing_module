import axios from "@/request/axiosReq";

const API_BASE = '/api/facebook';

const FacebookApiService = {
  getAuthUrl: async () => {
    const response = await axios.get(`${API_BASE}/auth/url`);
    return response.data;
  },

  getConnection: async () => {
    const response = await axios.get(`${API_BASE}/connection`);
    return response.data;
  },

  disconnect: async () => {
    const response = await axios.post(`${API_BASE}/disconnect`);
    return response.data;
  },

  getHappnexEvents: async () => {
    const response = await axios.get(`/api/admin/events/dropdown/eventsByOrg`);
    return response?.data?.data;
  },

  createCampaign: async (campaignData) => {
    const response = await axios.post(`${API_BASE}/campaigns`, campaignData);
    return response.data;
  },

  getCampaigns: async () => {
    const response = await axios.get(`${API_BASE}/campaigns`);
    return response.data;
  },

  mapPromotedEvent: async (data) => {
    const response = await axios.post(`${API_BASE}/promoted-event`, data);
    return response.data;
  },

  getPromotedEvent: async (campaignId) => {
    const response = await axios.get(`${API_BASE}/promoted-event/${campaignId}`);
    return response.data;
  },

  createCreative: async (formData) => {
    const response = await axios.post(`${API_BASE}/creative`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCreative: async (campaignId) => {
    const response = await axios.get(`${API_BASE}/creative/${campaignId}`);
    return response.data;
  },

  createAudience: async (audienceData) => {
    const response = await axios.post(`${API_BASE}/audiences`, audienceData);
    return response.data;
  },

  getAudiences: async () => {
    const response = await axios.get(`${API_BASE}/audiences`);
    return response.data;
  },

  createAdSet: async (adSetData) => {
    const response = await axios.post(`${API_BASE}/adsets`, adSetData);
    return response.data;
  },

  getAdSets: async (campaignId) => {
    const response = await axios.get(`${API_BASE}/adsets/${campaignId}`);
  
    return response?.data?.adsets;
  },

  createAd: async (adData) => {
    const response = await axios.post(`${API_BASE}/ads`, adData);
    return response.data;
  },

  getAds: async (campaignId) => {
    const response = await axios.get(`${API_BASE}/ads/${campaignId}`);
    return response.data;
  },

  publishCampaign: async (campaignId) => {
    const response = await axios.post(`${API_BASE}/publish/${campaignId}`);
    return response.data;
  },

  recordConversion: async (conversionData) => {
    const response = await axios.post(`${API_BASE}/conversions`, conversionData);
    return response.data;
  },

  getInsights: async (campaignId) => {
    const response = await axios.get(`${API_BASE}/insights/${campaignId}`);
    return response.data;
  },

  sync: async () => {
    const response = await axios.post(`${API_BASE}/sync`);
    return response.data;
  }
};

export default FacebookApiService;
