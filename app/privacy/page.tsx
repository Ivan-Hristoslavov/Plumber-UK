import type { Metadata } from 'next';
import PrivacyPageClient from './privacy-client';
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const companyName = BRAND_NAME;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/privacy`;
  
  return {
    title: `Privacy Policy`,
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