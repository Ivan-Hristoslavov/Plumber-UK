import type { Metadata } from 'next';
import GDPRPageClient from './gdpr-client';
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const companyName = BRAND_NAME;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/gdpr`;
  
  return {
    title: `GDPR Compliance`,
    description: `GDPR compliance information for ${companyName} plumbing services. Your rights regarding personal data protection.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `GDPR Compliance | ${companyName}`,
      description: `GDPR compliance information for ${companyName} plumbing services. Your rights regarding personal data protection.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function GDPRPage() {
  return <GDPRPageClient />;
}
