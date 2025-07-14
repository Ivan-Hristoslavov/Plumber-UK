import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VATSettings {
  enabled: boolean;
  rate: number;
  registrationNumber: string;
  companyName: string;
}

export function useVATSettings() {
  const [vatSettings, setVATSettings] = useState<VATSettings>({
    enabled: false,
    rate: 20.0,
    registrationNumber: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVATSettings();
  }, []);

  const fetchVATSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'vatSettings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.value) {
        const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setVATSettings({
          enabled: settings.enabled || false,
          rate: settings.rate || 20.0,
          registrationNumber: settings.registrationNumber || '',
          companyName: settings.companyName || ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch VAT settings');
    } finally {
      setLoading(false);
    }
  };

  const updateVATSettings = async (newSettings: Partial<VATSettings>) => {
    try {
      const updatedSettings = { ...vatSettings, ...newSettings };
      
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'vatSettings',
          value: JSON.stringify(updatedSettings)
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setVATSettings(updatedSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update VAT settings');
      return false;
    }
  };

  // Helper functions for VAT calculations
  const calculateVAT = (amount: number) => {
    if (!vatSettings.enabled) return { subtotal: amount, vatAmount: 0, total: amount };
    
    const subtotal = Number((amount / (1 + vatSettings.rate / 100)).toFixed(2));
    const vatAmount = Number((amount - subtotal).toFixed(2));
    
    return {
      subtotal,
      vatAmount,
      total: amount
    };
  };

  const addVAT = (subtotal: number) => {
    if (!vatSettings.enabled) return { subtotal, vatAmount: 0, total: subtotal };
    
    const vatAmount = Number((subtotal * vatSettings.rate / 100).toFixed(2));
    const total = Number((subtotal + vatAmount).toFixed(2));
    
    return {
      subtotal,
      vatAmount,
      total
    };
  };

  return {
    vatSettings,
    loading,
    error,
    updateVATSettings,
    refetch: fetchVATSettings,
    calculateVAT,
    addVAT,
    isVATEnabled: vatSettings.enabled
  };
} 