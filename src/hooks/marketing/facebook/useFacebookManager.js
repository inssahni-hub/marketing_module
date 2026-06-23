import { useState, useEffect, useCallback, useMemo } from 'react';
import { facebookApi } from '@/services/marketing/social/facebook/facebookAdManager/facebookApi.js';

export function useFacebookManager() {
  const [connection, setConnection] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  
  // Selection states
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);
  const [selectedCampaignAdSets, setSelectedCampaignAdSets] = useState([]);
  const [selectedCampaignInsights, setSelectedCampaignInsights] = useState(null);
  
  const [adSetsAds, setAdSetsAds] = useState({}); // Mapping of adsetId -> array of ads
  const [loadingAds, setLoadingAds] = useState({});

  // UI Flow and Filters
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'campaigns', 'details', 'adsets', 'ads', 'insights', 'connection'
  const [detailTab, setDetailTab] = useState('overview'); // 'overview', 'adsets', 'ads', 'insights'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'PAUSED', 'DRAFT'
  const [objectiveFilter, setObjectiveFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch connection state
  const fetchConnection = useCallback(async () => {
    try {
      const data = await facebookApi.getConnection();
      if (data.success) {
        setConnection(data);
      }
    } catch (e) {
      console.error('Failed to fetch connection details:', e);
    }
  }, []);

  // Fetch Dashboard and Campaign data
  const fetchDashboardAndCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parallelize to keep load speeds fast
      const [connRes, dashboardRes, campaignsRes] = await Promise.all([
        facebookApi.getConnection(),
        facebookApi.getDashboard(),
        facebookApi.getCampaigns()
      ]);

      if (connRes.success) setConnection(connRes);
      if (dashboardRes.success) setDashboard(dashboardRes);
      if (campaignsRes.success) {
        setCampaigns(campaignsRes.campaigns);
      }
    } catch (e) {
      console.error('Error loading Facebook Center data:', e);
      setError(e.message || 'An error occurred while communicating with the Facebook Marketing Server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specific campaign details (including ad sets and insights)
  const fetchCampaignDetailedInfo = useCallback(async (campaignId) => {
    if (!campaignId) return;
    setIsDetailLoading(true);
    setError(null);
    try {
      const [detailRes, adsetsRes, insightsRes] = await Promise.all([
        facebookApi.getCampaignDetail(campaignId),
        facebookApi.getAdSets(campaignId),
        facebookApi.getCampaignInsights(campaignId)
      ]);

      if (detailRes.success) setSelectedCampaignDetail(detailRes.campaign);
      if (adsetsRes.success) {
        setSelectedCampaignAdSets(adsetsRes.adsets);
        // Pre-fetch ads for all adsets automatically in the background
        adsetsRes.adsets.forEach(adset => {
          fetchAdsForAdset(adset.id);
        });
      }
      if (insightsRes.success) setSelectedCampaignInsights(insightsRes.insights);
    } catch (e) {
      console.error(`Error loading campaign ${campaignId} details:`, e);
      setError(`Failed to retrieve deep data for campaign ${campaignId}.`);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  // Fetch ads for a specific ad set
  const fetchAdsForAdset = async (adsetId) => {
    if (!adsetId) return;
    setLoadingAds(prev => ({ ...prev, [adsetId]: true }));
    try {
      const res = await facebookApi.getAdsByAdSet(adsetId);
      if (res.success) {
        setAdSetsAds(prev => ({ ...prev, [adsetId]: res.ads }));
      }
    } catch (e) {
      console.error(`Error fetching ads for adset ${adsetId}:`, e);
    } finally {
      setLoadingAds(prev => ({ ...prev, [adsetId]: false }));
    }
  };

  // Connect Ad Account Action
  const connectAccount = async (facebookUserId, adAccountId, accessToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await facebookApi.connectAccount({ facebookUserId, adAccountId, accessToken });
      if (res.success) {
        await fetchDashboardAndCampaigns();
        setCurrentView('dashboard');
        return true;
      }
      return false;
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Could not connect the Facebook account.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect Ad Account Action
  const disconnectAccount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await facebookApi.disconnectAccount();
      if (res.success) {
        setConnection(null);
        await fetchDashboardAndCampaigns();
        setCurrentView('connection');
        return true;
      }
      return false;
    } catch (e) {
      setError(e.message || 'Failed to disconnect the account.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh trigger
  const handleRefresh = () => {
    if (selectedCampaignId) {
      fetchCampaignDetailedInfo(selectedCampaignId);
    }
    fetchDashboardAndCampaigns();
  };

  // Monitor campaign selection changes
  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetailedInfo(selectedCampaignId);
    }
  }, [selectedCampaignId, fetchCampaignDetailedInfo]);

  // Initial load
  useEffect(() => {
    fetchDashboardAndCampaigns();
  }, [fetchDashboardAndCampaigns]);

  // Filter & Search & Sort Campaigns on client side
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // 1. Search Query filter (case-insensitive name or id or objective)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.id.toLowerCase().includes(q) ||
        c.objective.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    }

    // 3. Objective filter
    if (objectiveFilter !== 'ALL') {
      result = result.filter(c => c.objective === objectiveFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle numerical / boolean sorts if needed
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [campaigns, search, statusFilter, objectiveFilter, sortField, sortOrder]);

  // Paginated Campaigns
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredCampaigns.slice(startIndex, startIndex + pageSize);
  }, [filteredCampaigns, page, pageSize]);

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize) || 1;

  // Reset page when queries change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, objectiveFilter]);

  // Navigate to detailed campaign view
  const viewCampaignDetails = (campaignId, initialTab = 'overview') => {
    setSelectedCampaignId(campaignId);
    setDetailTab(initialTab);
    setCurrentView('details');
  };

  return {
    connection,
    dashboard,
    campaigns,
    filteredCampaigns,
    paginatedCampaigns,
    totalPages,
    page,
    setPage,
    pageSize,

    // Selections
    selectedCampaignId,
    setSelectedCampaignId,
    selectedCampaignDetail,
    selectedCampaignAdSets,
    selectedCampaignInsights,
    adSetsAds,
    loadingAds,
    fetchAdsForAdset,

    // Filters / sorting
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    objectiveFilter,
    setObjectiveFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,

    // State / Navigation
    currentView,
    setCurrentView,
    detailTab,
    setDetailTab,
    isLoading,
    isDetailLoading,
    error,
    setError,

    // Actions
    connectAccount,
    disconnectAccount,
    viewCampaignDetails,
    handleRefresh
  };
}
