'use client';

import { useState, useEffect } from 'react';

type DayOffSettings = {
  isEnabled: boolean;
  message: string;
  startDate: string;
  endDate: string;
  showOnAllPages: boolean;
};

export default function DayOffPage() {
  const [settings, setSettings] = useState<DayOffSettings>({
    isEnabled: false,
    message: 'We are currently on holiday. Emergency services are still available. Please call 0800 123 4567 for urgent matters.',
    startDate: '',
    endDate: '',
    showOnAllPages: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dayOffSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('dayOffSettings', JSON.stringify(settings));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = () => {
    setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Day Off Management</h1>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Day Off Status</h2>
            <p className="text-sm text-gray-600 mt-1">
              {settings.isEnabled ? 'Day off mode is currently active' : 'Day off mode is currently inactive'}
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.isEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {settings.isEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Day Off Settings</h2>
        
        <div className="space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day Off Message
            </label>
            <textarea
              value={settings.message}
              onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Enter the message to display when day off mode is active..."
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Display Options */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showOnAllPages}
                onChange={(e) => setSettings(prev => ({ ...prev, showOnAllPages: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show day off banner on all pages (sticky notification)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      {settings.isEnabled && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Day Off Notice</h3>
                <p className="mt-1 text-sm text-yellow-700">{settings.message}</p>
                {(settings.startDate || settings.endDate) && (
                  <p className="mt-2 text-xs text-yellow-600">
                    {settings.startDate && `From: ${new Date(settings.startDate).toLocaleDateString()}`}
                    {settings.startDate && settings.endDate && ' - '}
                    {settings.endDate && `Until: ${new Date(settings.endDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 