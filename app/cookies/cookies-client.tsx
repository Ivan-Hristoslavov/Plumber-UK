"use client";

import { useAdminProfile } from "@/components/AdminProfileContext";
import { LegalPageClient } from "@/components/LegalPageClient";

function CookiesFallback() {
  const adminProfile = useAdminProfile();
  const businessData = {
    businessName: adminProfile?.company_name,
    businessEmail: adminProfile?.business_email,
    businessPhone: adminProfile?.phone,
  };

  return (
    <>
      <h1>Cookie Policy</h1>
      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files placed on your device when you visit a website. They help websites work efficiently and provide information to owners.</p>
      <h2>How We Use Cookies</h2>
      <p>{businessData.businessName || "We"} use cookies to remember preferences, understand usage, improve experience, and provide personalized content.</p>
      <h2>Types of Cookies</h2>
      <p><strong>Essential:</strong> Required for the site to function. <strong>Analytics:</strong> Help us understand visitor behavior. <strong>Functional:</strong> Remember your choices.</p>
      <h2>Managing Cookies</h2>
      <p>You can control cookies in your browser settings. Blocking them may affect site functionality.</p>
      <h2>Contact</h2>
      <p>Questions? Email {businessData.businessEmail} or call {businessData.businessPhone}.</p>
    </>
  );
}

export default function CookiesPageClient() {
  return (
    <LegalPageClient
      slug="cookies"
      title="Cookie Policy"
      apiEndpoint="/api/cookies"
      contactTitle="Questions about cookies?"
      fallbackContent={<CookiesFallback />}
    />
  );
}
