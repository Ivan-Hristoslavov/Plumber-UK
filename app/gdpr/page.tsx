import type { Metadata } from 'next';
import { getAdminProfile } from "@/lib/admin-profile";
import GDPRPageClient from './gdpr-client';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/gdpr`;
  
  return {
    title: `GDPR Compliance | ${companyName} - Emergency Plumber London`,
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
