"use client";

import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useVATSettings } from "@/hooks/useVATSettings";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminPricingManager } from "@/components/AdminPricingManager";
import { AdminGalleryManager } from "@/components/AdminGalleryManager";
import { ServiceAreasManager } from "@/components/ServiceAreasManager";
import { AdminFAQManager } from "@/components/AdminFAQManager";
import { AdminLegalManager } from "@/components/AdminLegalManager";
import { GoogleCalendarIntegration } from "@/components/GoogleCalendarIntegration";
import { useToast, ToastMessages } from "@/components/Toast";
import {
  SettingsNavigation,
  SettingsTab,
} from "@/components/SettingsNavigation";

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
  responseTime: string;

  // Business Credentials
  gasSafeRegistered: boolean;
  gasSafeNumber: string;
  fullyInsured: boolean;
  insuranceProvider: string;
  companyStatus: string; // e.g., "Ltd", "Limited", "PLC", etc.

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
  responseTime: "45 minutes",

  gasSafeRegistered: true,
  gasSafeNumber: "123456",
  fullyInsured: true,
  insuranceProvider: "Professional Indemnity Insurance",
  companyStatus: "",

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

  // State to control modal opening in child components
  const [triggerModal, setTriggerModal] = useState<string | null>(null);

  // Function to handle tab changes with scroll to top
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    // Scroll to top when tab changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Effect to scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Function to trigger modal in child components
  const triggerChildModal = (modalType: string) => {
    setTriggerModal(modalType);
    // Reset after a short delay to allow child component to pick it up
    setTimeout(() => setTriggerModal(null), 100);
  };

  const { profile: dbProfile, refresh: refreshProfile } = useAdminProfile();
  const { settings: vatSettings, updateVATSettings } = useVATSettings();
  const { settings: adminSettings, refreshCache: refreshAdminSettings } =
    useAdminSettings();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSettings();
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      },
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
        "Settings saved successfully!",
      );
      setTimeout(() => setMessage(""), 3000);
      refreshProfile(); // Refresh profile to update client-side display
      refreshAdminSettings(); // Refresh admin settings cache
    } catch (error) {
      console.error("Error saving settings:", error);
      showError(
        ToastMessages.profile.error.title,
        "Error saving settings. Please try again.",
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

  const tabs: SettingsTab[] = [
    {
      id: "business",
      name: "Business Info",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Company details and credentials",
      category: "business",
    },
    {
      id: "working-hours",
      name: "Working Hours",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Set your availability",
      category: "business",
    },
    {
      id: "pricing",
      name: "Pricing Cards",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Manage service pricing",
      category: "business",
    },
    {
      id: "vat",
      name: "VAT Settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Configure tax settings",
      category: "business",
    },
    {
      id: "gallery",
      name: "Gallery",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Manage before/after photos",
      category: "content",
    },
    {
      id: "areas",
      name: "Service Areas",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <path
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Coverage locations",
      category: "content",
    },
    {
      id: "faq",
      name: "FAQ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Frequently asked questions",
      category: "content",
    },
    {
      id: "legal",
      name: "Legal Pages",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "Terms and privacy policy",
      category: "content",
    },
    {
      id: "connections",
      name: "Integrations",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      description: "External service connections",
      category: "integrations",
    },
  ];

  // Define which tabs need save buttons vs action buttons
  const tabsWithSaveButtons = ["business", "working-hours", "vat"];
  const tabsWithActionButtons = ["faq", "gallery", "pricing", "areas", "legal"];

  const needsSaveButton = tabsWithSaveButtons.includes(activeTab);
  const needsActionButtons = tabsWithActionButtons.includes(activeTab);

  // Get action button for current tab
  const getActionButton = () => {
    switch (activeTab) {
      case "faq":
        return {
          label: "Add New FAQ",
          icon: "➕",
          onClick: () => triggerChildModal("faq"),
        };
      case "gallery":
        return {
          label: "Add Gallery Item",
          icon: "🖼️",
          onClick: () => triggerChildModal("gallery"),
        };
      case "pricing":
        return {
          label: "Add Pricing Card",
          icon: "💰",
          onClick: () => triggerChildModal("pricing"),
        };
      case "areas":
        return {
          label: "Add Service Area",
          icon: "📍",
          onClick: () => triggerChildModal("areas"),
        };
      case "legal":
        return {
          label: "Add Legal Page",
          icon: "📋",
          onClick: () => triggerChildModal("legal"),
        };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();

  // Group tabs by category for horizontal navigation
  const groupedTabs = tabs.reduce(
    (acc, tab) => {
      if (!acc[tab.category]) {
        acc[tab.category] = [];
      }
      acc[tab.category].push(tab);

      return acc;
    },
    {} as Record<string, SettingsTab[]>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Horizontal Navigation */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your business configuration
              </p>
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
              <div key={category} className="flex items-center space-x-4">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
                {category !==
                  Object.keys(groupedTabs)[
                    Object.keys(groupedTabs).length - 1
                  ] && (
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <SettingsNavigation
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Main Content - Full width */}
      <div className="w-full">
        <div className="p-4 lg:p-8 pb-8 w-full max-w-full lg:pt-4 pt-0">
          {/* Success/Error Message - Show on both mobile and desktop */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.includes("Error")
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              } transition-colors duration-300`}
            >
              {message}
            </div>
          )}

          {/* Page Header with Action Buttons */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {tabs.find((tab) => tab.id === activeTab)?.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tabs.find((tab) => tab.id === activeTab)?.description}
                </p>
              </div>

              {/* Save Button - Show for all tabs */}
              {needsSaveButton && (
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
              )}

              {/* Action Button - Show only for specific tabs */}
              {actionButton && (
                <button
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={actionButton.onClick}
                >
                  <span className="mr-2">{actionButton.icon}</span>
                  {actionButton.label}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Save Button - Always visible on mobile */}
          <div className="lg:hidden mb-6">
            <div className="flex flex-col gap-4">
              {/* Mobile action buttons can be added here if needed */}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "business" && (
            <div className="space-y-8">
              {/* Business Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business City
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
                      Business Postcode
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      VAT Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={settings.vatNumber}
                      onChange={(e) =>
                        handleInputChange("vatNumber", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Registration Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={settings.registrationNumber}
                      onChange={(e) =>
                        handleInputChange("registrationNumber", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Response Time
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="e.g., 45 minutes"
                      type="text"
                      value={settings.responseTime || "45 minutes"}
                      onChange={(e) =>
                        handleInputChange("responseTime", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Status
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={settings.companyStatus}
                      onChange={(e) =>
                        handleInputChange("companyStatus", e.target.value)
                      }
                    >
                      <option value="">Select status</option>
                      <option value="Ltd">Limited (Ltd)</option>
                      <option value="Limited">Limited</option>
                      <option value="PLC">Public Limited Company (PLC)</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Trader">Sole Trader</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Credentials */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 transition-colors duration-300">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Professional Credentials
                </h2>
                <div className="space-y-2">
                  {/* MSC Certification */}
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
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
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-green-800 dark:text-green-200">
                          MSC Certified
                        </h3>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          MICROGENERATION Certificate Scheme
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        checked={settings.gasSafeRegistered}
                        className="sr-only peer"
                        type="checkbox"
                        onChange={(e) =>
                          handleInputChange(
                            "gasSafeRegistered",
                            e.target.checked,
                          )
                        }
                      />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {/* Registration Number */}
                  {settings.gasSafeRegistered && (
                    <div className="ml-7">
                      <input
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="Registration Number"
                        type="text"
                        value={settings.gasSafeNumber}
                        onChange={(e) =>
                          handleInputChange("gasSafeNumber", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Insurance */}
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-blue-800 dark:text-blue-200">
                          Fully Insured
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          Comprehensive liability coverage
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        checked={settings.fullyInsured}
                        className="sr-only peer"
                        type="checkbox"
                        onChange={(e) =>
                          handleInputChange("fullyInsured", e.target.checked)
                        }
                      />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  {/* Insurance Provider */}
                  {settings.fullyInsured && (
                    <div className="ml-7">
                      <input
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="Insurance Provider"
                        type="text"
                        value={settings.insuranceProvider}
                        onChange={(e) =>
                          handleInputChange("insuranceProvider", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                  Service Rates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Emergency Rate (per hour)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        £
                      </span>
                      <input
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        value={settings.emergencyRate}
                        onChange={(e) =>
                          handleInputChange("emergencyRate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Standard Rate (per hour)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        £
                      </span>
                      <input
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        value={settings.standardRate}
                        onChange={(e) =>
                          handleInputChange("standardRate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "working-hours" && (
            <div className="space-y-8">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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

          {activeTab === "pricing" && (
            <AdminPricingManager triggerModal={triggerModal === "pricing"} />
          )}

          {activeTab === "vat" && (
            <div className="space-y-8">
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
                        checked={vatSettings?.is_enabled || false}
                        className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                        type="checkbox"
                        onChange={(e) =>
                          updateVATSettings({ is_enabled: e.target.checked })
                        }
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        Enable VAT on invoices
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 transition-colors duration-300">
                      When enabled, VAT will be calculated and added to all
                      invoices
                    </p>
                  </div>

                  {/* VAT Settings (only shown when enabled) */}
                  {vatSettings?.is_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          VAT Rate (%)
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          max="100"
                          min="0"
                          step="0.01"
                          type="number"
                          value={vatSettings?.vat_rate || 20}
                          onChange={(e) =>
                            updateVATSettings({
                              vat_rate: parseFloat(e.target.value) || 0,
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
                          placeholder="GB123456789"
                          type="text"
                          value={vatSettings?.vat_number || ""}
                          onChange={(e) =>
                            updateVATSettings({ vat_number: e.target.value })
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Company Name for VAT
                        </label>
                        <input
                          disabled
                          className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          placeholder="Your Company Name Ltd"
                          type="text"
                          value={dbProfile?.company_name || ""}
                        />
                      </div>
                    </div>
                  )}

                  {/* VAT Disabled Notice */}
                  {!vatSettings?.is_enabled && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
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
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            VAT is currently disabled
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>
                              All invoices will be generated without VAT. You
                              can enable VAT at any time and configure your VAT
                              rate and registration details.
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
          {activeTab === "gallery" && (
            <AdminGalleryManager triggerModal={triggerModal === "gallery"} />
          )}
          {activeTab === "areas" && (
            <ServiceAreasManager triggerModal={triggerModal === "areas"} />
          )}
          {activeTab === "faq" && (
            <AdminFAQManager triggerModal={triggerModal === "faq"} />
          )}
          {activeTab === "legal" && (
            <AdminLegalManager triggerModal={triggerModal === "legal"} />
          )}

          {activeTab === "connections" && (
            <div className="space-y-8">
              {/* Google Calendar Integration */}
              <GoogleCalendarIntegration />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
