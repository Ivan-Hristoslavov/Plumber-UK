"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { AdminPricingManager } from "@/components/AdminPricingManager";
import { AdminGalleryManager } from "@/components/AdminGalleryManager";
import { ServiceAreasManager } from "@/components/ServiceAreasManager";
import { AdminFAQManager } from "@/components/AdminFAQManager";

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
  businessName: "Fix My Leak",
  businessEmail: "info@fixmyleak.com",
  businessPhone: "+44 7700 900123",
  businessAddress: "London, UK",
  emergencyRate: "150",
  standardRate: "75",
  dayOffEnabled: false,
  dayOffMessage:
    "Limited service hours today. Emergency services available 24/7.",
  dayOffStartDate: "",
  dayOffEndDate: "",
  emailNotifications: true,
  smsNotifications: false,
  autoConfirmBookings: false,
  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "general" | "pricing" | "gallery" | "areas" | "faq"
  >("general");
  const { profile: dbProfile } = useAdminProfile();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Update settings with data from admin profile
    if (dbProfile) {
      setSettings((prev) => ({
        ...prev,
        businessName: dbProfile.company_name || prev.businessName,
        businessEmail: dbProfile.email || prev.businessEmail,
        businessPhone: dbProfile.phone || prev.businessPhone,
        businessAddress: dbProfile.company_address || prev.businessAddress,
      }));
    }
  }, [dbProfile]);

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

      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings. Please try again.");
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
          Settings & Content Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
          Manage your business settings, pricing, gallery, and website content.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "general", name: "General Settings", icon: "⚙️" },
            { id: "pricing", name: "Pricing Cards", icon: "💰" },
            { id: "gallery", name: "Gallery", icon: "🖼️" },
            { id: "areas", name: "Service Areas", icon: "📍" },
            { id: "faq", name: "FAQ", icon: "❓" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Manage your business settings and preferences.
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
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  type="text"
                  value={settings.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Email
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) =>
                    handleInputChange("businessEmail", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Phone
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  type="tel"
                  value={settings.businessPhone}
                  onChange={(e) =>
                    handleInputChange("businessPhone", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Business Address
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  type="text"
                  value={settings.businessAddress}
                  onChange={(e) =>
                    handleInputChange("businessAddress", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Working Hours
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Start Time
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
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

          {/* Notifications 
          {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  checked={settings.emailNotifications}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                  type="checkbox"
                  onChange={(e) =>
                    handleInputChange("emailNotifications", e.target.checked)
                  }
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Enable email notifications
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  checked={settings.smsNotifications}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                  type="checkbox"
                  onChange={(e) =>
                    handleInputChange("smsNotifications", e.target.checked)
                  }
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Enable SMS notifications
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  checked={settings.autoConfirmBookings}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                  type="checkbox"
                  onChange={(e) =>
                    handleInputChange("autoConfirmBookings", e.target.checked)
                  }
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Auto-confirm bookings
                </span>
              </label>
            </div>
          </div>
          */}
        </div>
      )}

      {activeTab === "pricing" && <AdminPricingManager />}
      {activeTab === "gallery" && <AdminGalleryManager />}
      {activeTab === "areas" && <ServiceAreasManager />}
      {activeTab === "faq" && <AdminFAQManager />}
    </div>
  );
}
