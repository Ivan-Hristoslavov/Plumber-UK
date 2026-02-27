"use client";

import { LegalPageClient } from "@/components/LegalPageClient";

export default function PrivacyPageClient() {
  return (
    <LegalPageClient
      slug="privacy"
      title="Privacy Policy"
      apiEndpoint="/api/privacy"
      contactTitle="Privacy questions?"
    />
  );
}
