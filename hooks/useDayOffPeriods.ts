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

export function useDayOffPeriods() {
  const [periods, setPeriods] = useState<DayOffPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchPeriods = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setError(null);
      
      const response = await fetch(`/api/admin/day-off?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch day-off periods');
      }
      
      const data: DayOffPeriod[] = await response.json();
      
      if (!isMountedRef.current) return;
      
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
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
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
    setLoading(true);
    fetchPeriods();
  }, [fetchPeriods]);

  const addPeriod = useCallback(async (period: Omit<DayOffPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add period');
    
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

export function useActiveDayOffPeriods() {
  const { periods, loading, error } = useDayOffPeriods();
  
  function parseLocalDate(dateString: string, isEnd: boolean = false): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return new Date(dateString);
    }
    if (isEnd) {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const activePeriods = periods.filter(period => {
    if (!period.show_banner) return false;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const start = parseLocalDate(period.start_date, false);
    const end = parseLocalDate(period.end_date, true);

    const overlapsToday = start <= todayEnd && end >= todayStart;
    return overlapsToday;
  });

  return {
    activePeriods,
    loading,
    error
  };
}
