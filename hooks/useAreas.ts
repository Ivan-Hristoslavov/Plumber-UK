import { useState, useEffect } from 'react';

interface Area {
  id: number;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
}

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await fetch('/api/areas');
        if (!response.ok) {
          throw new Error('Failed to fetch areas');
        }
        const data = await response.json();
        setAreas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAreas();
  }, []);

  return { areas, loading, error };
} 