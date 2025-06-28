"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { ServiceAreasManager } from "@/components/ServiceAreasManager";
import { AdminPricingManager } from "@/components/AdminPricingManager";
import { AdminGalleryManager } from "@/components/AdminGalleryManager";
import { AdminReviewsManager } from '@/components/AdminReviewsManager';
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useToast, ToastMessages } from "@/components/Toast";

type ProfileData = {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  about: string;

  // About Me Customization
  yearsOfExperience: string;
  specializations: string;
  certifications: string;
  responseTime: string;

  // Business Information
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPostcode: string;
  businessPhone: string;
  businessEmail: string;
  vatNumber: string;
  registrationNumber: string;

  // Banking Information
  bankName: string;
  accountNumber: string;
  sortCode: string;

  // Professional Information
  gasRegNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;

  // Avatar
  avatar: string;
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "personal" | "business" | "security" | "areas" | "pricing" | "gallery" | "reviews"
  >("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { profile: dbProfile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Plamen",
    lastName: "Zhelev",
    email: "plamen@fixmyleak.co.uk",
    phone: "+44 7700 900123",
    about: "",

    yearsOfExperience: "10+",
    specializations: "Emergency repairs, Boiler installations, Bathroom plumbing",
    certifications: "Gas Safe Registered, City & Guilds Level 3",
    responseTime: "45 minutes",

    businessName: "Fix My Leak Ltd",
    businessAddress: "123 Plumbing Street",
    businessCity: "London",
    businessPostcode: "SW1A 1AA",
    businessPhone: "0800 123 4567",
    businessEmail: "info@fixmyleak.co.uk",
    vatNumber: "GB123456789",
    registrationNumber: "12345678",

    bankName: "Barclays Bank",
    accountNumber: "12345678",
    sortCode: "20-00-00",

    gasRegNumber: "GAS123456",
    insuranceProvider: "Zurich Insurance",
    insurancePolicyNumber: "POL123456789",

    avatar: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Load profile data from database
    if (dbProfile && !loading) {
      const [firstName, ...lastNameParts] = dbProfile.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      setProfileData({
        firstName: firstName || "Plamen",
        lastName: lastName || "Zhelev",
        email: dbProfile.email || "plamen@fixmyleak.co.uk",
        phone: dbProfile.phone || "+44 7700 900123",
        about: dbProfile.about || "",

        yearsOfExperience: dbProfile.years_of_experience || "10+",
        specializations: dbProfile.specializations || "Emergency repairs, Boiler installations, Bathroom plumbing",
        certifications: dbProfile.certifications || "Gas Safe Registered, City & Guilds Level 3",
        responseTime: dbProfile.response_time || "45 minutes",

        businessName: dbProfile.company_name || "Fix My Leak Ltd",
        businessAddress: dbProfile.company_address || "123 Plumbing Street",
        businessCity: "London",
        businessPostcode: "SW1A 1AA",
        businessPhone: dbProfile.phone || "0800 123 4567",
        businessEmail: dbProfile.email || "info@fixmyleak.co.uk",
        vatNumber: "GB123456789",
        registrationNumber: "12345678",

        bankName: dbProfile.bank_name || "Barclays Bank",
        accountNumber: dbProfile.account_number || "12345678",
        sortCode: dbProfile.sort_code || "20-00-00",

        gasRegNumber: dbProfile.gas_safe_number || "GAS123456",
        insuranceProvider: dbProfile.insurance_provider || "Zurich Insurance",
        insurancePolicyNumber: "POL123456789",

        avatar: "",
      });
    }
  }, [dbProfile, loading]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Prepare the data for the API
      const profileUpdate = {
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.phone,
        about: profileData.about,
        years_of_experience: profileData.yearsOfExperience,
        specializations: profileData.specializations,
        certifications: profileData.certifications,
        response_time: profileData.responseTime,
        company_name: profileData.businessName,
        company_address: profileData.businessAddress,
        bank_name: profileData.bankName,
        account_number: profileData.accountNumber,
        sort_code: profileData.sortCode,
        gas_safe_number: profileData.gasRegNumber,
        insurance_provider: profileData.insuranceProvider,
      };

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileUpdate),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      showSuccess(ToastMessages.profile.updated.title, ToastMessages.profile.updated.message);
    } catch (error) {
      showError(ToastMessages.profile.error.title, ToastMessages.profile.error.message);
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(ToastMessages.general.validationError.title, "New password and confirmation do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError(ToastMessages.general.validationError.title, "Password must be at least 6 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      showSuccess(ToastMessages.profile.passwordChanged.title, ToastMessages.profile.passwordChanged.message);
    } catch (error) {
      showError(ToastMessages.profile.error.title, ToastMessages.profile.error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", name: "Personal Info", icon: "👤" },
    { id: "business", name: "Business Info", icon: "🏢" },
    { id: "security", name: "Security", icon: "🔒" },
    { id: "areas", name: "Service Areas", icon: "🗺️" },
    { id: "pricing", name: "Pricing", icon: "💷" },
    { id: "gallery", name: "Gallery", icon: "📸" },
    { id: "reviews", name: "Reviews", icon: "📋" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Manage your personal information and business details.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <div
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                saveMessage.includes("Error") ||
                saveMessage.includes("do not match") ||
                saveMessage.includes("must be")
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              } transition-colors duration-300`}
            >
              <svg
                className={`w-4 h-4 mr-2 ${saveMessage.includes("Error") || saveMessage.includes("do not match") || saveMessage.includes("must be") ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {saveMessage.includes("Error") ||
                saveMessage.includes("do not match") ||
                saveMessage.includes("must be") ? (
                  <path
                    clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    fillRule="evenodd"
                  />
                ) : (
                  <path
                    clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    fillRule="evenodd"
                  />
                )}
              </svg>
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center transition-colors duration-300">
              <span className="text-white font-bold text-2xl">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{profileData.email}</p>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{profileData.phone}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-300">
                <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mr-1 transition-colors duration-300" />
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      First Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Last Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Email Address
                    </label>
                    <input
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                      type="email"
                      value={profileData.email}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Phone Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      About Me
                    </label>
                    <MarkdownEditor
                      value={profileData.about}
                      onChange={(value) =>
                        setProfileData({
                          ...profileData,
                          about: value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      This will be displayed on your public profile page.
                    </p>
                  </div>

                  {/* About Me Customization Fields */}
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                      About Me Customization
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Years of Experience
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          type="text"
                          placeholder="e.g., 10+ years"
                          value={profileData.yearsOfExperience}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              yearsOfExperience: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Response Time
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          type="text"
                          placeholder="e.g., 45 minutes"
                          value={profileData.responseTime}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              responseTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Specializations
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          type="text"
                          placeholder="e.g., Emergency repairs, Boiler installations, Bathroom plumbing"
                          value={profileData.specializations}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              specializations: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Certifications
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          type="text"
                          placeholder="e.g., Gas Safe Registered, City & Guilds Level 3"
                          value={profileData.certifications}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              certifications: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
                      These fields help customize how your information appears on the public website.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Business Information Tab */}
          {activeTab === "business" && (
            <div className="space-y-8">
              {/* Business Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business Address
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.businessAddress}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      City
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.businessCity}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessCity: e.target.value,
                        })
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
                      value={profileData.businessPostcode}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessPostcode: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business Phone
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="tel"
                      value={profileData.businessPhone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business Email
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="email"
                      value={profileData.businessEmail}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessEmail: e.target.value,
                        })
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
                      value={profileData.vatNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          vatNumber: e.target.value,
                        })
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
                      value={profileData.registrationNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          registrationNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Banking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Bank Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.bankName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Account Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.accountNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          accountNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Sort Code
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.sortCode}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          sortCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Professional Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Gas Safe Registration Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.gasRegNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          gasRegNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Insurance Provider
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.insuranceProvider}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          insuranceProvider: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Insurance Policy Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.insurancePolicyNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          insurancePolicyNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Security Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          Change Password
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          Update your account password for enhanced security.
                        </p>
                      </div>
                      <button
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                      >
                        {showPasswordForm ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Current Password
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            New Password
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Confirm New Password
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                            disabled={isSaving}
                            onClick={handleChangePassword}
                          >
                            {isSaving ? "Changing..." : "Change Password"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas Tab */}
          {activeTab === "areas" && (
            <ServiceAreasManager />
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <AdminPricingManager />
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <AdminGalleryManager />
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <AdminReviewsManager />
          )}
        </div>
      </div>
    </div>
  );
}
