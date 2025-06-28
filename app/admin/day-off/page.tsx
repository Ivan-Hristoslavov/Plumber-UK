"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast, ToastMessages } from "@/components/Toast";

type DayOffSettings = {
  isEnabled: boolean;
  message: string;
  startDate: string;
  endDate: string;
  showOnAllPages: boolean;
};

export default function DayOffPage() {
  const { showSuccess, showError } = useToast();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [settings, setSettings] = useState<DayOffSettings>({
    isEnabled: false,
    message: "Limited service hours today. Emergency services available 24/7.",
    startDate: today,
    endDate: today,
    showOnAllPages: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log("Loading Day Off settings from database...");

      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value")
        .eq("key", "dayOffSettings")
        .single();

      if (error) {
        console.error("Error loading settings:", error);
        // If no settings exist yet, use defaults
        if (error.code === "PGRST116") {
          console.log("No Day Off settings found, using defaults");
        }
      } else {
        console.log("Loaded settings from database:", data);

        if (data?.value) {
          const dayOffData = data.value;
          const loadedSettings = {
            isEnabled: dayOffData.isEnabled || false,
            message:
              dayOffData.message ||
              "Limited service hours today. Emergency services available 24/7.",
            startDate: dayOffData.startDate || today,
            endDate: dayOffData.endDate || today,
            showOnAllPages: dayOffData.showOnAllPages || false,
          };

          console.log("Processed settings object:", loadedSettings);
          setSettings(loadedSettings);
        }
      }
    } catch (error) {
      console.error("Unexpected error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDayOffSettings = async () => {
    try {
      const dayOffData = {
        isEnabled: settings.isEnabled,
        message: settings.message,
        startDate: settings.startDate,
        endDate: settings.endDate,
        showOnAllPages: settings.showOnAllPages,
      };

      console.log("Saving Day Off settings:", dayOffData);

      // First, check if the record exists
      const { data: existingData, error: checkError } = await supabase
        .from("admin_settings")
        .select("id")
        .eq("key", "dayOffSettings")
        .single();

      let result;

      if (checkError && checkError.code === "PGRST116") {
        // Record doesn't exist, insert new one
        console.log("Creating new dayOffSettings record");
        result = await supabase.from("admin_settings").insert({
          key: "dayOffSettings",
          value: dayOffData,
        });
      } else if (existingData) {
        // Record exists, update it
        console.log("Updating existing dayOffSettings record");
        result = await supabase
          .from("admin_settings")
          .update({ value: dayOffData })
          .eq("key", "dayOffSettings");
      } else {
        throw new Error("Unexpected error checking for existing record");
      }

      if (result.error) {
        console.error("Supabase error saving settings:", result.error);
        throw new Error(
          `Failed to save Day Off settings: ${result.error.message}`
        );
      }

      console.log("Successfully saved Day Off settings:", result.data);
    } catch (error) {
      console.error("Unexpected error:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      console.log("Starting to save Day Off settings:", settings);

      // Save settings to database as single JSON object
      await saveDayOffSettings();

      console.log("Day Off settings saved successfully");
      showSuccess(ToastMessages.profile.dayOffSaved.title, ToastMessages.profile.dayOffSaved.message);
    } catch (error) {
      console.error("Failed to save settings:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      showError(ToastMessages.profile.error.title, `Error saving settings: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = () => {
    setSettings((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  const handleInputChange = (key: keyof DayOffSettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      // If start date is changed and it's after end date, update end date
      if (key === "startDate" && value > prev.endDate) {
        newSettings.endDate = value;
      }

      return newSettings;
    });
  };

  // Check if day off should be automatically disabled
  const checkAutoDisable = () => {
    if (settings.endDate && settings.isEnabled) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(settings.endDate);

      if (today > endDate) {
        return true; // Should be auto-disabled
      }
    }

    return false;
  };

  const isAutoDisabled = checkAutoDisable();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 transition-colors duration-300" />
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors duration-300">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-300" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors duration-300" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Day Off Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
              Configure your day off settings and customer notifications.
            </p>
          </div>
          <button
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`p-4 rounded-lg ${
              saveMessage.includes("Error")
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
            } transition-colors duration-300`}
          >
            {saveMessage}
          </div>
        )}

        {/* Auto-disable warning */}
        {isAutoDisabled && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  fillRule="evenodd"
                />
              </svg>
              <p className="text-orange-800 font-medium">
                Day off period has expired and will be automatically disabled
                when customers visit the site.
              </p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-full ${settings.isEnabled ? "bg-yellow-100" : "bg-green-100"}`}
              >
                {settings.isEnabled ? (
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Day Off Status
                </h2>
                <p
                  className={`text-sm mt-1 ${settings.isEnabled ? "text-yellow-600" : "text-green-600"}`}
                >
                  {settings.isEnabled
                    ? "Day off mode is currently ACTIVE"
                    : "Day off mode is currently INACTIVE"}
                </p>
                {settings.isEnabled &&
                  (settings.startDate || settings.endDate) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.startDate &&
                        `From: ${new Date(settings.startDate).toLocaleDateString("en-GB")}`}
                      {settings.startDate && settings.endDate && " - "}
                      {settings.endDate &&
                        `Until: ${new Date(settings.endDate).toLocaleDateString("en-GB")}`}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`text-sm font-medium ${settings.isEnabled ? "text-yellow-600" : "text-gray-500"}`}
              >
                {settings.isEnabled ? "Active" : "Inactive"}
              </span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.isEnabled ? "bg-yellow-500" : "bg-gray-200"
                }`}
                onClick={handleToggle}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Day Off Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your day off message and display settings.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day Off Message
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="Enter the message to display when day off mode is active..."
                rows={4}
                value={settings.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This message will be displayed to customers when day off mode is
                enabled.
              </p>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    min={today}
                    type="date"
                    value={settings.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    End Date
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    min={settings.startDate || today}
                    type="date"
                    value={settings.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                If specified, the banner will automatically appear/disappear
                based on these dates.
                <strong>
                  {" "}
                  Day off will be automatically disabled after the end date.
                </strong>
              </p>
            </div>

            {/* Display Options */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Display Options
              </h3>
              <label className="flex items-start space-x-3">
                <input
                  checked={settings.showOnAllPages}
                  className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                  type="checkbox"
                  onChange={(e) =>
                    handleInputChange("showOnAllPages", e.target.checked)
                  }
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show banner on all pages
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Display a sticky notification banner at the top of all
                    website pages when day off mode is active.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        {settings.isEnabled && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Banner Preview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This is exactly how the banner will appear to customers.
              </p>
            </div>

            <div className="p-6">
              {/* Exact copy of client day off banner */}
              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 animate-gradient-x rounded-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center animate-pulse">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            clipRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        {settings.startDate &&
                        new Date() < new Date(settings.startDate)
                          ? "Upcoming Day Off"
                          : "Day Off Notice"}
                      </span>
                      <span className="text-xs text-amber-800 font-medium">
                        {settings.message}
                      </span>
                      {(settings.startDate || settings.endDate) && (
                        <div className="hidden lg:flex items-center bg-amber-500/40 rounded-full px-3 py-1">
                          <span className="text-xs font-semibold text-amber-900">
                            📅{" "}
                            {settings.startDate &&
                              `From: ${new Date(settings.startDate).toLocaleDateString("en-GB")}`}
                            {settings.startDate &&
                              settings.endDate &&
                              " • "}
                            {settings.endDate &&
                              `Until: ${new Date(settings.endDate).toLocaleDateString("en-GB")}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-amber-900 hover:text-white transition-all duration-200 flex items-center justify-center group"
                      onClick={() => {
                        // This is just for preview - doesn't actually dismiss
                      }}
                    >
                      <svg
                        className="h-3 w-3 group-hover:rotate-90 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How Day Off Mode Works
              </h3>
              <div className="text-blue-800 space-y-2 text-sm">
                <p>
                  • <strong>Automatic Management:</strong> Set start and end
                  dates, and the system will automatically show/hide the banner
                </p>
                <p>
                  • <strong>Auto-Disable:</strong> Day off mode automatically
                  turns off after the end date passes
                </p>
                <p>
                  • <strong>Database Storage:</strong> All settings are saved to
                  the database and sync across all pages
                </p>
                <p>
                  • <strong>Customer Experience:</strong> Customers see a
                  professional notice banner at the top of all pages
                </p>
                <p>
                  • <strong>Emergency Contact:</strong> Include emergency
                  contact information in your message for urgent matters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
