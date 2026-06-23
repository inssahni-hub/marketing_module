import axios from "@/request/axiosReq";
export const smsApiService = {
  // Configured check
  getTenantId() {
  try {
    return JSON.parse(localStorage.getItem('auth_user'))?._id || '';
  } catch {
    return '';
  }
},

  setTenantId(id) {
    if (id) {
      localStorage.setItem('active_organizer_id', id);
    } else {
      localStorage.removeItem('active_organizer_id');
    }
  },

  // ==========================================
  // CORE DROPDOWNS
  // ==========================================
  async getEvents() {
    const res = await axios.get('/api/marketing/core/events');
    return res.data;
  },

  async getOrganizers() {
    const res = await axios.get('/api/marketing/core/organizers');
    return res.data;
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  async getDashboardData() {
    const res = await axios.get('/api/marketing/sms/dashboard');
    return res.data;
  },

  // ==========================================
  // TEMPLATES
  // ==========================================
  async getTemplates(params = {}) {
    const res = await axios.get('/api/marketing/sms/templates', { params });
    return res.data;
  },

  async getTemplateById(id) {
    const res = await axios.get(`/api/marketing/sms/templates/${id}`);
    return res.data;
  },

  async createTemplate(data) {
    const res = await axios.post('/api/marketing/sms/templates', data);
    return res.data;
  },

  async updateTemplate(id, data) {
    const res = await axios.put(`/api/marketing/sms/templates/${id}`, data);
    return res.data;
  },

  async deleteTemplate(id) {
    const res = await axios.delete(`/api/marketing/sms/templates/${id}`);
    return res.data;
  },

  async duplicateTemplate(id) {
    const res = await axios.post(`/api/marketing/sms/templates/${id}/duplicate`);
    return res.data;
  },

  // ==========================================
  // CAMPAIGNS
  // ==========================================
  async getCampaigns(params = {}) {
    const res = await axios.get('/api/marketing/sms/campaigns', { params });
    return res.data;
  },

  async getCampaignById(id) {
    const res = await axios.get(`/api/marketing/sms/campaigns/${id}`);
    return res.data;
  },

  async createCampaign(data) {
    const res = await axios.post('/api/marketing/sms/campaigns', data);
    return res.data;
  },

  async updateCampaign(id, data) {
    const res = await axios.put(`/api/marketing/sms/campaigns/${id}`, data);
    return res.data;
  },

  async deleteCampaign(id) {
    const res = await axios.delete(`/api/marketing/sms/campaigns/${id}`);
    return res.data;
  },

  async duplicateCampaign(id) {
    const res = await axios.post(`/api/marketing/sms/campaigns/${id}/duplicate`);
    return res.data;
  },

  async sendCampaignNow(id) {
    const res = await axios.post(`/api/marketing/sms/campaigns/${id}/send`);
    return res.data;
  },

  async cancelCampaign(id) {
    const res = await axios.post(`/api/marketing/sms/campaigns/${id}/cancel`);
    return res.data;
  },

  async getCampaignRecipients(id, params = {}) {
    const res = await axios.get(`/api/marketing/sms/campaigns/${id}/recipients`, { params });
    return res.data;
  },

  // ==========================================
  // QUOTA, BILLING & PLANS
  // ==========================================
  async getCurrentPlanAndUsage() {
    const res = await axios.get('/api/marketing/sms/plan');
    return res.data;
  },

  async upgradeQuotaPlan(data) {
    const res = await axios.post('/api/marketing/sms/plan/upgrade', data);
    return res.data;
  },

  async getBillingPlans() {
    const res = await axios.get('/api/marketing/sms/plan/billing');
    return res.data;
  }
};
