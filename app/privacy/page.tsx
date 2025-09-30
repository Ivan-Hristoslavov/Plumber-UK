import type { Metadata } from 'next';
import { getAdminProfile } from "@/lib/admin-profile";
import PrivacyPageClient from './privacy-client';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/privacy`;
  
  return {
    title: `Privacy Policy | ${companyName} - Emergency Plumber London`,
    description: `Privacy policy for ${companyName} plumbing services. How we collect, use, and protect your personal information.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Privacy Policy | ${companyName}`,
      description: `Privacy policy for ${companyName} plumbing services. How we collect, use, and protect your personal information.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function PrivacyPage() {
  return <PrivacyPageClient />;
} 