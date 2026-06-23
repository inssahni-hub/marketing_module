import { useState, useEffect, useCallback } from 'react';
import {
  trackPixelConversion,
  getConversionList,
  getAttributionReport
} from '../../services/marketing/conversionService.js';

export function useConversions() {
  const [conversions, setConversions] = useState([]);
  const [attribution, setAttribution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, attrRes] = await Promise.all([
        getConversionList(),
        getAttributionReport()
      ]);
      if (listRes.success) setConversions(listRes.data);
      if (attrRes.success) setAttribution(attrRes.data);
    } catch (err) {
      console.error('Error loading conversions data:', err);
      setError(err.message || 'Failed to fetch conversions logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversionData();
  }, [fetchConversionData]);

  const handleTrackConversion = async (conversionData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await trackPixelConversion(conversionData);
      if (res.success) {
        await fetchConversionData();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message || 'Failed to track pixel conversion');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    conversions,
    attribution,
    loading,
    error,
    refresh: fetchConversionData,
    trackConversion: handleTrackConversion
  };
}
