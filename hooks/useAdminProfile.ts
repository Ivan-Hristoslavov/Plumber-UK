import { useState, useEffect } from 'react';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  business_email: string;
  phone: string;
  company_name: string;
  company_address: string;
  about: string;
  years_of_experience: string;
  specializations: string;
  certifications: string;
  response_time: string;
  bank_name: string;
  account_number: string;
  sort_code: string;
  gas_safe_number: string;
  insurance_provider: string;
  created_at: string;
  updated_at: string;
}

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/admin/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, loading, error };
} 