"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useToast, ToastMessages } from "@/components/Toast";

type LegalContent = {
  terms_and_conditions: string;
  privacy_policy: string;
};

export function AdminLegalManager() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [content, setContent] = useState<LegalContent>({
    terms_and_conditions: "",
    privacy_policy: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadLegalContent();
  }, []);

  const loadLegalContent = async () => {
    try {
      setLoading(true);
      
      // Load from admin_profile table
      const { data: profile, error } = await supabase
        .from("admin_profile")
        .select("terms_and_conditions, privacy_policy")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading legal content:", error);
        return;
      }

      if (profile) {
        setContent({
          terms_and_conditions: profile.terms_and_conditions || "",
          privacy_policy: profile.privacy_policy || "",
        });
      }
    } catch (error) {
      console.error("Error loading legal content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("admin_profile")
        .update({
          terms_and_conditions: content.terms_and_conditions,
          privacy_policy: content.privacy_policy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1); // Assuming single admin profile

      if (error) {
        throw error;
      }

      showSuccess("Legal Content Updated", "Terms and Privacy Policy have been saved successfully!");
    } catch (error) {
      console.error("Error saving legal content:", error);
      showError("Save Error", "Failed to save legal content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "terms", name: "Terms & Conditions", icon: "📋" },
    { id: "privacy", name: "Privacy Policy", icon: "🔒" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Legal Content Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Manage your Terms & Conditions and Privacy Policy content.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-300 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "terms" | "privacy")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
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

      {/* Content Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        {activeTab === "terms" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Terms & Conditions
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Use Markdown formatting for rich text. This content will be displayed on your Terms of Service page.
              </p>
            </div>
            <MarkdownEditor
              value={content.terms_and_conditions}
              onChange={(value) => setContent({ ...content, terms_and_conditions: value })}
              placeholder="Enter your Terms & Conditions here using Markdown formatting..."
            />
          </div>
        )}

        {activeTab === "privacy" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Privacy Policy
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Use Markdown formatting for rich text. This content will be displayed on your Privacy Policy page.
              </p>
            </div>
            <MarkdownEditor
              value={content.privacy_policy}
              onChange={(value) => setContent({ ...content, privacy_policy: value })}
              placeholder="Enter your Privacy Policy here using Markdown formatting..."
            />
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
          Preview
        </h3>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {activeTab === "terms" && content.terms_and_conditions ? (
            <div dangerouslySetInnerHTML={{ __html: content.terms_and_conditions }} />
          ) : activeTab === "privacy" && content.privacy_policy ? (
            <div dangerouslySetInnerHTML={{ __html: content.privacy_policy }} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No content to preview. Start typing in the editor above.
            </p>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips for Legal Content
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use clear, simple language that your customers can understand</li>
          <li>• Include information about data collection, usage, and storage</li>
          <li>• Specify your service terms, cancellation policies, and payment terms</li>
          <li>• Mention your contact information for legal inquiries</li>
          <li>• Consider consulting with a legal professional for comprehensive coverage</li>
        </ul>
      </div>
    </div>
  );
} 