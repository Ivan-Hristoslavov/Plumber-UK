import type { Metadata } from 'next';
import CookiesPageClient from './cookies-client';
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const companyName = BRAND_NAME;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/cookies`;
  
  return {
    title: `Cookie Policy`,
    description: `Cookie policy for ${companyName} plumbing services. Information about how we use cookies and tracking technologies.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Cookie Policy | ${companyName}`,
      description: `Cookie policy for ${companyName} plumbing services. Information about how we use cookies and tracking technologies.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function CookiesPage() {
  return <CookiesPageClient />;
}
