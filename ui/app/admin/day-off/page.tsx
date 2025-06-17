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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Day Off Management</h1>
          <p className="text-gray-600 mt-1">Manage holiday notices and day off announcements for your customers.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
              saveMessage.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              <svg className={`w-4 h-4 mr-2 ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                {saveMessage.includes('Error') ? (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {saveMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${settings.isEnabled ? 'bg-yellow-100' : 'bg-green-100'}`}>
                {settings.isEnabled ? (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Day Off Status</h2>
                <p className={`text-sm mt-1 ${settings.isEnabled ? 'text-yellow-600' : 'text-green-600'}`}>
                  {settings.isEnabled ? 'Day off mode is currently ACTIVE' : 'Day off mode is currently INACTIVE'}
                </p>
                {settings.isEnabled && (settings.startDate || settings.endDate) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.startDate && `From: ${new Date(settings.startDate).toLocaleDateString()}`}
                    {settings.startDate && settings.endDate && ' - '}
                    {settings.endDate && `Until: ${new Date(settings.endDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${settings.isEnabled ? 'text-yellow-600' : 'text-gray-500'}`}>
                {settings.isEnabled ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.isEnabled ? 'bg-yellow-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Day Off Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">Configure your day off message and display settings.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day Off Message
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={settings.message}
              onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter the message to display when day off mode is active..."
            />
            <p className="text-xs text-gray-500 mt-2">This message will be displayed to customers when day off mode is enabled.</p>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">If specified, the date range will be displayed alongside the message.</p>
          </div>

          {/* Display Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Display Options</h3>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={settings.showOnAllPages}
                onChange={(e) => setSettings(prev => ({ ...prev, showOnAllPages: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Show banner on all pages
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Display a sticky notification banner at the top of all website pages when day off mode is active.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      {settings.isEnabled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600 mt-1">This is how your day off notice will appear to customers.</p>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Day Off Notice</h3>
                  <p className="text-yellow-700 leading-relaxed">{settings.message}</p>
                  {(settings.startDate || settings.endDate) && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        📅 Schedule:
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {settings.startDate && `From: ${new Date(settings.startDate).toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}`}
                        {settings.startDate && settings.endDate && <br />}
                        {settings.endDate && `Until: ${new Date(settings.endDate).toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}`}
                      </p>
                    </div>
                  )}
                </div>
                <button className="flex-shrink-0 text-yellow-600 hover:text-yellow-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">How it works</h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Toggle the switch to activate/deactivate day off mode</li>
              <li>• Customize your message to inform customers about your availability</li>
              <li>• Set optional start and end dates for automatic scheduling</li>
              <li>• The banner will appear on all pages when enabled and "Show on all pages" is checked</li>
              <li>• Customers can dismiss the banner, but it will reappear on page refresh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 