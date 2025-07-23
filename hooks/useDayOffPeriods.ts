import { useState, useEffect, useCallback, useRef } from 'react';

export interface DayOffPeriod {
  id?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_type?: string | null;
  show_banner: boolean;
  banner_message?: string;
  created_at?: string;
  updated_at?: string;
}

// Global cache to prevent duplicate API calls
let cachedData: DayOffPeriod[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export function useDayOffPeriods() {
  const [periods, setPeriods] = useState<DayOffPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchPeriods = useCallback(async () => {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      setPeriods(cachedData);
      setLoading(false);
      return;
    }

    if (!isMountedRef.current) return;

    try {
      setError(null);
      
      const response = await fetch('/api/admin/day-off');
      if (!response.ok) {
        throw new Error('Failed to fetch day-off periods');
      }
      
      const data: DayOffPeriod[] = await response.json();
      
      if (!isMountedRef.current) return;

      // Update cache
      cachedData = data;
      cacheTimestamp = now;
      
      setPeriods(data);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPeriods([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Debounce API calls
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPeriods();
    }, 100);

    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchPeriods]);

  const refetch = useCallback(() => {
    // Clear cache to force fresh data
    cachedData = null;
    cacheTimestamp = 0;
    setLoading(true);
    fetchPeriods();
  }, [fetchPeriods]);

  // CRUD operations that clear cache
  const addPeriod = useCallback(async (period: Omit<DayOffPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add period');
    
    // Clear cache and refetch
    cachedData = null;
    cacheTimestamp = 0;
    await fetchPeriods();
    return data;
  }, [fetchPeriods]);

  const updatePeriod = useCallback(async (period: DayOffPeriod) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update period');
    
    // Clear cache and refetch
    cachedData = null;
    cacheTimestamp = 0;
    await fetchPeriods();
    return data;
  }, [fetchPeriods]);

  const deletePeriod = useCallback(async (id: string) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete period');
    
    // Clear cache and refetch
    cachedData = null;
    cacheTimestamp = 0;
    await fetchPeriods();
    return data;
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    error,
    refetch,
    addPeriod,
    updatePeriod,
    deletePeriod
  };
}

// Helper hook for getting only active periods
export function useActiveDayOffPeriods() {
  const { periods, loading, error } = useDayOffPeriods();
  
  const activePeriods = periods.filter(period => {
    if (!period.show_banner) return false;
    
    const today = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    
    return today >= start && today <= end;
  });

  return {
    activePeriods,
    loading,
    error
  };
} 