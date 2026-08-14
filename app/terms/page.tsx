import type { Metadata } from 'next';
import TermsPageClient from './terms-client';
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const companyName = BRAND_NAME;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/terms`;
  
  return {
    title: `Terms & Conditions`,
    description: `Terms and conditions for ${companyName} plumbing services. Professional emergency plumber covering South West London.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Terms & Conditions | ${companyName}`,
      description: `Terms and conditions for ${companyName} plumbing services.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function TermsPage() {
  return <TermsPageClient />;
} 