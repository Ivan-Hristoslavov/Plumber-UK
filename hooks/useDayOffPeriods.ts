import { useState, useEffect } from 'react';

export interface DayOffPeriod {
  id?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  show_banner: boolean;
  banner_message?: string;
  is_recurring: boolean;
  recurrence_type?: string | null;
}

export function useDayOffPeriods() {
  const [periods, setPeriods] = useState<DayOffPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/day-off');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch day off periods');
      setPeriods(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPeriod = async (period: Omit<DayOffPeriod, 'id'>) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add period');
    await fetchPeriods();
    return data;
  };

  const updatePeriod = async (period: DayOffPeriod) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update period');
    await fetchPeriods();
    return data;
  };

  const deletePeriod = async (id: string) => {
    const res = await fetch('/api/admin/day-off', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete period');
    await fetchPeriods();
    return data;
  };

  useEffect(() => { fetchPeriods(); }, []);

  return { periods, loading, error, addPeriod, updatePeriod, deletePeriod, refetch: fetchPeriods };
} 