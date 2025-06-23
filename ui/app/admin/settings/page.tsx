'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type AdminSetting = {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

type SettingsState = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  emergencyRate: string;
  standardRate: string;
  dayOffEnabled: boolean;
  dayOffMessage: string;
  dayOffStartDate: string;
  dayOffEndDate: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoConfirmBookings: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
};

const defaultSettings: SettingsState = {
  businessName: 'Fix My Leak',
  businessEmail: 'info@fixmyleak.com',
  businessPhone: '+44 7700 900123',
  businessAddress: 'London, UK',
  emergencyRate: '150',
  standardRate: '75',
  dayOffEnabled: false,
  dayOffMessage: 'Limited service hours today. Emergency services available 24/7.',
  dayOffStartDate: '',
  dayOffEndDate: '',
  emailNotifications: true,
  smsNotifications: false,
  autoConfirmBookings: false,
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) {
        console.error('Error loading settings:', error);
      } else {
        // Convert array of settings to object
        const settingsObj = { ...defaultSettings };
        data?.forEach((setting: AdminSetting) => {
          if (setting.key in settingsObj) {
            const value = setting.value;
            // Handle different data types
            if (setting.key === 'dayOffEnabled' || setting.key === 'emailNotifications' || 
                setting.key === 'smsNotifications' || setting.key === 'autoConfirmBookings') {
              (settingsObj as any)[setting.key] = value === 'true';
            } else if (setting.key === 'workingDays') {
              (settingsObj as any)[setting.key] = JSON.parse(value);
            } else {
              (settingsObj as any)[setting.key] = value;
            }
          }
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key, value: stringValue });

      if (error) {
        console.error('Error saving setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Save all settings
      const savePromises = Object.entries(settings).map(([key, value]) =>
        saveSetting(key, value)
      );

      await Promise.all(savePromises);
      setMessage('Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your business settings and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Business Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
            <input
              type="email"
              value={settings.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
            <input
              type="tel"
              value={settings.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
            <input
              type="text"
              value={settings.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Standard Hourly Rate (£)</label>
            <input
              type="number"
              value={settings.standardRate}
              onChange={(e) => handleInputChange('standardRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Rate (£)</label>
            <input
              type="number"
              value={settings.emergencyRate}
              onChange={(e) => handleInputChange('emergencyRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Working Hours</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => handleInputChange('workingHoursStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => handleInputChange('workingHoursEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.workingDays.includes(day)}
                    onChange={() => toggleWorkingDay(day)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day Off Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Day Off Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="dayOffEnabled"
              checked={settings.dayOffEnabled}
              onChange={(e) => handleInputChange('dayOffEnabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="dayOffEnabled" className="text-sm font-medium text-gray-700">
              Enable Day Off Banner
            </label>
          </div>
          
          {settings.dayOffEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day Off Message</label>
                <textarea
                  value={settings.dayOffMessage}
                  onChange={(e) => handleInputChange('dayOffMessage', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={settings.dayOffStartDate}
                    onChange={(e) => handleInputChange('dayOffStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={settings.dayOffEndDate}
                    onChange={(e) => handleInputChange('dayOffEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
              Email Notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="smsNotifications"
              checked={settings.smsNotifications}
              onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
              SMS Notifications
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoConfirmBookings"
              checked={settings.autoConfirmBookings}
              onChange={(e) => handleInputChange('autoConfirmBookings', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoConfirmBookings" className="text-sm font-medium text-gray-700">
              Auto-confirm Bookings
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 