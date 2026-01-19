import type { Metadata } from 'next';
import { getAdminProfile } from "@/lib/admin-profile";
import CookiesPageClient from './cookies-client';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/cookies`;
  
  return {
    title: `Cookie Policy | ${companyName} - Emergency Plumber London`,
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
