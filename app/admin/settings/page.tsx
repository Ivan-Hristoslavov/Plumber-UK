"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useVATSettings } from "@/hooks/useVATSettings";
import { AdminPricingManager } from "@/components/AdminPricingManager";
import { AdminGalleryManager } from "@/components/AdminGalleryManager";
import { ServiceAreasManager } from "@/components/ServiceAreasManager";
import { AdminFAQManager } from "@/components/AdminFAQManager";
import { AdminLegalManager } from "@/components/AdminLegalManager";
import { GoogleCalendarIntegration } from "@/components/GoogleCalendarIntegration";
import { useToast, ToastMessages } from "@/components/Toast";

type AdminSetting = {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

type SettingsState = {
  // Business Information (now read-only, managed in admin_profile)
  businessCity: string;
  businessPostcode: string;
  vatNumber: string;
  registrationNumber: string;

  // Pricing
  emergencyRate: string;
  standardRate: string;

  // Working Hours
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];

  // Day Off Settings
  dayOffEnabled: boolean;
  dayOffMessage: string;
  dayOffStartDate: string;
  dayOffEndDate: string;

  // Website Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoConfirmBookings: boolean;

  // VAT Settings
  vatEnabled: boolean;
  vatRate: number;
  vatCompanyName: string;
};

const defaultSettings: SettingsState = {
  businessCity: "London",
  businessPostcode: "SW1A 1AA",
  vatNumber: "GB123456789",
  registrationNumber: "12345678",

  emergencyRate: "150",
  standardRate: "75",

  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],

  dayOffEnabled: false,
  dayOffMessage:
    "Limited service hours today. Emergency services available 24/7.",
  dayOffStartDate: "",
  dayOffEndDate: "",

  emailNotifications: true,
  smsNotifications: false,
  autoConfirmBookings: false,

  vatEnabled: false,
  vatRate: 20.0,
  vatCompanyName: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "business"
    | "working-hours"
    | "pricing"
    | "vat"
    | "gallery"
    | "areas"
    | "faq"
    | "legal"
    | "connections"
  >("business");
  const { profile: dbProfile } = useAdminProfile();
  const { vatSettings, updateVATSettings } = useVATSettings();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  // Remove the useEffect that was syncing duplicated fields
  // Business info is now managed directly in admin_profile table

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("admin_settings").select("*");

      if (error) {
        console.error("Error loading settings:", error);
        return;
      }

      const settingsMap: { [key: string]: any } = {};
      data?.forEach((setting: AdminSetting) => {
        try {
          settingsMap[setting.key] = JSON.parse(setting.value);
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      });

      setSettings((prev) => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase.from("admin_settings").upsert(
      {
        key,
        value: JSON.stringify(value),
      },
      {
        onConflict: "key",
      }
    );

    if (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      // Save each setting
      const settingsToSave = Object.entries(settings);
      for (const [key, value] of settingsToSave) {
        await saveSetting(key, value);
      }

      showSuccess(
        ToastMessages.profile.updated.title,
        "Settings saved successfully!"
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      showError(
        ToastMessages.profile.error.title,
        "Error saving settings. Please try again."
      );
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkingDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const tabs = [
    { id: "business", name: "Business Info", icon: "🏢" },
    { id: "working-hours", name: "Working Hours", icon: "🕒" },
    { id: "pricing", name: "Pricing", icon: "💰" },
    { id: "vat", name: "VAT Settings", icon: "🧾" },
    { id: "gallery", name: "Gallery", icon: "🖼️" },
    { id: "areas", name: "Service Areas", icon: "📍" },
    { id: "faq", name: "FAQ", icon: "❓" },
    { id: "legal", name: "Legal", icon: "📋" },
    { id: "connections", name: "Connections", icon: "🔗" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Business Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
          Manage your business information, working hours, pricing, and website
          content.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "business" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Business Information
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Manage your business details and company information.
              </p>
            </div>
            <button
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              } transition-colors duration-300`}
            >
              {message}
            </div>
          )}

          {/* Business Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Name
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                  type="text"
                  value={dbProfile?.company_name || "Fix My Leak"}
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  To change this, go to Admin Profile → Personal Info
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Email
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                  type="email"
                  value={dbProfile?.email || "info@fixmyleak.com"}
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  To change this, go to Admin Profile → Personal Info
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Phone
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                  type="tel"
                  value={dbProfile?.phone || "+44 7700 900123"}
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  To change this, go to Admin Profile → Personal Info
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Address
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300 resize-none"
                  rows={3}
                  value={dbProfile?.company_address || "London, UK"}
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  To change this, go to Admin Profile → Personal Info
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  City
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="text"
                  value={settings.businessCity}
                  onChange={(e) =>
                    handleInputChange("businessCity", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Postcode
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="text"
                  value={settings.businessPostcode}
                  onChange={(e) =>
                    handleInputChange("businessPostcode", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Company Registration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Company Registration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  VAT Number
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="text"
                  placeholder="GB123456789"
                  value={settings.vatNumber}
                  onChange={(e) =>
                    handleInputChange("vatNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Company Registration Number
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="text"
                  placeholder="12345678"
                  value={settings.registrationNumber}
                  onChange={(e) =>
                    handleInputChange("registrationNumber", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Pricing Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Service Rates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Standard Rate (£/hour)
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="number"
                  value={settings.standardRate}
                  onChange={(e) =>
                    handleInputChange("standardRate", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Emergency Rate (£/hour)
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  type="number"
                  value={settings.emergencyRate}
                  onChange={(e) =>
                    handleInputChange("emergencyRate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "working-hours" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Working Hours
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Set your working hours and available days for bookings.
              </p>
            </div>
            <button
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Working Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Business Hours
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Start Time
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) =>
                      handleInputChange("workingHoursStart", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    End Time
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) =>
                      handleInputChange("workingHoursEnd", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <label
                      key={day}
                      className="inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        checked={settings.workingDays.includes(day)}
                        className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                        type="checkbox"
                        onChange={() => toggleWorkingDay(day)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize transition-colors duration-300">
                        {day}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Day Off Settings */}
          {/*<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Day Off Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    checked={settings.dayOffEnabled}
                    className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                    type="checkbox"
                    onChange={(e) => handleInputChange("dayOffEnabled", e.target.checked)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Enable Day Off Mode
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 transition-colors duration-300">
                  Show a banner on your website when you're not available
                </p>
              </div>

              {settings.dayOffEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Day Off Message
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
                      rows={3}
                      value={settings.dayOffMessage}
                      onChange={(e) => handleInputChange("dayOffMessage", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        Start Date
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="date"
                        value={settings.dayOffStartDate}
                        onChange={(e) => handleInputChange("dayOffStartDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        End Date
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="date"
                        value={settings.dayOffEndDate}
                        onChange={(e) => handleInputChange("dayOffEndDate", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>*/}

          {/* Website Settings */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Website Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  checked={settings.emailNotifications}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                  type="checkbox"
                  onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Enable email notifications for bookings
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  checked={settings.autoConfirmBookings}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                  type="checkbox"
                  onChange={(e) => handleInputChange("autoConfirmBookings", e.target.checked)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Automatically confirm new bookings
                </span>
              </label>
            </div>
          </div> */}
        </div>
      )}

      {activeTab === "pricing" && <AdminPricingManager />}

      {activeTab === "vat" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                VAT Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Configure VAT settings for invoices and billing.
              </p>
            </div>
            <button
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* VAT Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              VAT Configuration
            </h2>

            <div className="space-y-6">
              {/* Enable VAT */}
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    checked={vatSettings.enabled}
                    className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                    type="checkbox"
                    onChange={(e) =>
                      updateVATSettings({ enabled: e.target.checked })
                    }
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Enable VAT on invoices
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 transition-colors duration-300">
                  When enabled, VAT will be calculated and added to all invoices
                </p>
              </div>

              {/* VAT Settings (only shown when enabled) */}
              {vatSettings.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      VAT Rate (%)
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={vatSettings.rate}
                      onChange={(e) =>
                        updateVATSettings({
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      VAT Registration Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="GB123456789"
                      value={vatSettings.registrationNumber}
                      onChange={(e) =>
                        updateVATSettings({ registrationNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Name for VAT
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="Your Company Name Ltd"
                      value={vatSettings.companyName}
                      onChange={(e) =>
                        updateVATSettings({ companyName: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* VAT Disabled Notice */}
              {!vatSettings.enabled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        VAT is currently disabled
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          All invoices will be generated without VAT. You can
                          enable VAT at any time and configure your VAT rate and
                          registration details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === "gallery" && <AdminGalleryManager />}
      {activeTab === "areas" && <ServiceAreasManager />}
      {activeTab === "faq" && <AdminFAQManager />}
      {activeTab === "legal" && <AdminLegalManager />}

      {activeTab === "connections" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Connections & Integrations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Connect your business with external services and platforms.
              </p>
            </div>
          </div>

          {/* Google Calendar Integration */}
          <GoogleCalendarIntegration />
        </div>
      )}
    </div>
  );
}
