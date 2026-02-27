"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ListManager } from "@/components/AdminProfileData";
import { useToast, ToastMessages } from "@/components/Toast";

type ProfileData = {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  businessEmail: string;
  phone: string;
  about: string;

  // Company Information
  companyName: string;
  companyAddress: string;

  // Professional Information
  insuranceProvider: string;
  yearsOfExperience: string;
  specializations: string;
  certifications: string;
  responseTime: string;

  // Banking Information
  bankName: string;
  accountNumber: string;
  sortCode: string;

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
    "personal" | "professional" | "security"
  >("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { profile: dbProfile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    businessEmail: "",
    phone: "",
    about: "",

    companyName: "",
    companyAddress: "",

    insuranceProvider: "",
    yearsOfExperience: "",
    specializations: "",
    certifications: "",
    responseTime: "",

    bankName: "",
    accountNumber: "",
    sortCode: "",

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
      const [firstName, ...lastNameParts] = dbProfile.name.split(" ");
      const lastName = lastNameParts.join(" ");

      setProfileData({
        firstName: firstName || "Plamen",
        lastName: lastName || "Zhelev",
        email: dbProfile.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "plamen@fixmyleak.co.uk",
        businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "admin@fixmyleak.co.uk",
        phone: dbProfile.phone || "+44 7700 900123",
        about: dbProfile.about || "",

        companyName: dbProfile.company_name || "Fix My Leak",
        companyAddress: dbProfile.company_address || "London, UK",

        insuranceProvider: dbProfile.insurance_provider || "Zurich Insurance",
        yearsOfExperience: dbProfile.years_of_experience || "",
        specializations: dbProfile.specializations || "",
        certifications: dbProfile.certifications || "",
        responseTime: dbProfile.response_time || "",

        bankName: dbProfile.bank_name || "Barclays Bank",
        accountNumber: dbProfile.account_number || "12345678",
        sortCode: dbProfile.sort_code || "20-00-00",

        avatar: "",
      });
    }
  }, [dbProfile, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          businessEmail: profileData.businessEmail,
          phone: profileData.phone,
          about: profileData.about,
          companyName: profileData.companyName,
          companyAddress: profileData.companyAddress,
          insuranceProvider: profileData.insuranceProvider,
          yearsOfExperience: profileData.yearsOfExperience,
          specializations: profileData.specializations,
          certifications: profileData.certifications,
          responseTime: profileData.responseTime,
          bankName: profileData.bankName,
          accountNumber: profileData.accountNumber,
          sortCode: profileData.sortCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      showSuccess("Profile Updated", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage("Error saving profile. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
      showError("Save Failed", "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(
        ToastMessages.general.validationError.title,
        "New password and confirmation do not match."
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError(
        ToastMessages.general.validationError.title,
        "Password must be at least 6 characters long."
      );
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

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      showSuccess(
        ToastMessages.profile.passwordChanged.title,
        ToastMessages.profile.passwordChanged.message
      );
    } catch (error) {
      showError(
        ToastMessages.profile.error.title,
        ToastMessages.profile.error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { 
      id: "personal", 
      name: "Personal Info", 
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: "security", 
      name: "Security", 
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
          Manage your personal information and professional credentials
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-8 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-3xl">
                {profileData.firstName[0] || "?"}
                {profileData.lastName[0] || "?"}
              </span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5 truncate">{profileData.email}</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm truncate">{profileData.phone}</p>
            <span className="inline-flex items-center mt-2 sm:mt-3 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2" />
              Administrator
            </span>
          </div>
          {saveMessage && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
              saveMessage.includes("Error") || saveMessage.includes("do not match") || saveMessage.includes("must be")
                ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="flex bg-gray-50 dark:bg-gray-700/50 p-0.5 sm:p-1 gap-0.5 sm:gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="flex-shrink-0">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Personal Information Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                </div>
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
                      Admin Email (Login)
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                      type="email"
                      value={profileData.email}
                      readOnly
                      title="Admin email cannot be changed for security reasons"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This email is used for admin login and cannot be changed.
                    </p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This email will be displayed to customers and used for business communications.
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
                </div>
              </div>

              {/* About Me Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  About Me
                </h4>
                <MarkdownEditor
                  value={profileData.about}
                  onChange={(value) =>
                    setProfileData({ ...profileData, about: value })
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  This will be displayed on your public profile page.
                </p>
              </div>

              {/* Professional Information Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Professional Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Years of Experience
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., 10+ Years"
                      value={profileData.yearsOfExperience}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          yearsOfExperience: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be displayed on your website (e.g., "10+ Years").
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Insurance Provider
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., Zurich Insurance"
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
                    <ListManager
                      value={profileData.specializations}
                      onChange={(value) =>
                        setProfileData({
                          ...profileData,
                          specializations: value,
                        })
                      }
                      label="Specializations"
                      placeholder="e.g., Emergency repairs"
                      description="List your main areas of expertise. Press Enter or click + to add each item."
                    />
                  </div>
                  <div>
                    <ListManager
                      value={profileData.certifications}
                      onChange={(value) =>
                        setProfileData({
                          ...profileData,
                          certifications: value,
                        })
                      }
                      label="Certifications"
                      placeholder="e.g., Gas Safe Registered"
                      description="List your professional certifications and qualifications. Press Enter or click + to add each item."
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your typical response time for customer inquiries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Information Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Company Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., Fix My Leak"
                      value={profileData.companyName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Address
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
                      rows={3}
                      placeholder="e.g., 123 Main Street, London, SW1A 1AA"
                      value={profileData.companyAddress}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          companyAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-medium shadow-sm"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Security
                  </h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        Password
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Last changed: Never
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      {showPasswordForm ? "Cancel" : "Change Password"}
                    </button>
                  </div>
                </div>

                {showPasswordForm && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
                        Confirm Password
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
                    <div className="md:col-span-3">
                      <button
                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
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
          )}
        </div>
      </div>
    </div>
  );
}
