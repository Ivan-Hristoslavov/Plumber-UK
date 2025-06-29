import { useState, useEffect } from 'react';

export type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  icon: string;
  service_type: string;
  order: number;
  is_active: boolean;
};

export function useServices() {
  const [data, setData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const services = await response.json();
      setData(services);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchServices,
  };
} 