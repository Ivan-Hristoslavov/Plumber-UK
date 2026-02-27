"use client";

import { useAdminProfile } from "@/components/AdminProfileContext";
import { LegalPageClient } from "@/components/LegalPageClient";

function GDPRFallback() {
  const adminProfile = useAdminProfile();
  const businessData = {
    businessName: adminProfile?.company_name,
    businessEmail: adminProfile?.business_email,
    businessPhone: adminProfile?.phone,
  };

  return (
    <>
      <h1>GDPR Compliance</h1>
      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
      <h2>Your Rights Under GDPR</h2>
      <p>You have rights regarding your personal data: Access, Rectification, Erasure, Restrict Processing, Data Portability, Object, and rights related to automated decision-making.</p>
      <h2>How to Exercise Your Rights</h2>
      <p>Contact us below. We will respond within one month.</p>
      <h2>Data Controller</h2>
      <p><strong>{businessData.businessName || "We"}</strong> is the data controller.</p>
      <h2>Contact</h2>
      <p>Email {businessData.businessEmail} or call {businessData.businessPhone}.</p>
      <h2>Complaints</h2>
      <p>You may lodge a complaint with the UK ICO: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
    </>
  );
}

export default function GDPRPageClient() {
  return (
    <LegalPageClient
      slug="gdpr"
      title="GDPR Compliance"
      apiEndpoint="/api/gdpr"
      contactTitle="GDPR questions?"
      fallbackContent={<GDPRFallback />}
    />
  );
}
