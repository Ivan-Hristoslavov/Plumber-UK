"use client";

import { LegalPageClient } from "@/components/LegalPageClient";

export default function TermsPageClient() {
  return (
    <LegalPageClient
      slug="terms"
      title="Terms & Conditions"
      apiEndpoint="/api/terms"
      contactTitle="Questions about these terms?"
    />
  );
}
