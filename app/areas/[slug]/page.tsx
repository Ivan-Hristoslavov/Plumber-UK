import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AreaPage } from "@/components/AreaPage";
import { getAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";
import { responseTimeMinutes } from "@/lib/response-time";

// Areas change rarely — regenerate hourly so new admin entries appear without a redeploy.
export const revalidate = 3600;

type Area = {
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
};

async function getActiveAreas(): Promise<Area[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_areas_cover")
      .select("name, slug, postcode, description, response_time")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) return [];

    return data || [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const areas = await getActiveAreas();

  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const areas = await getActiveAreas();
  const area = areas.find((a) => a.slug === slug);

  if (!area) return {};

  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const responseTime = responseTimeMinutes(area.response_time || profile?.response_time);

  // Root layout applies a `%s | <company> - Emergency Plumber London` template,
  // so keep this half short enough that the combined title survives truncation.
  const title = `Emergency Plumber ${area.name} ${area.postcode}`;
  const description = `Emergency plumber in ${area.name} (${area.postcode}). Leak detection, burst pipes, blocked drains and boiler repairs — ${responseTime}-minute response, same-day service. Fully insured, 10+ years experience. Call now.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/areas/${area.slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/areas/${area.slug}`,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      images: [{ url: "/fix_my_leak_logo.jpg", width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function AreaSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const areas = await getActiveAreas();
  const area = areas.find((a) => a.slug === slug);

  if (!area) notFound();

  const profile = await getAdminProfile();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";

  // Nearby areas power internal linking between area pages — the main reason
  // these pages rank as a cluster rather than as isolated orphans.
  const nearbyAreas = areas
    .filter((a) => a.slug !== area.slug)
    .slice(0, 6)
    .map((a) => ({ name: a.name, slug: a.slug }));

  const localKeywords = [
    `emergency plumber ${area.name}`,
    `plumber ${area.postcode}`,
    `leak detection ${area.name}`,
    `burst pipe repair ${area.name}`,
    `blocked drain ${area.name}`,
    `boiler repair ${area.name}`,
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Emergency Plumbing",
    name: `Emergency Plumber in ${area.name}`,
    description: area.description,
    areaServed: {
      "@type": "City",
      name: area.name,
      address: {
        "@type": "PostalAddress",
        postalCode: area.postcode,
        addressLocality: area.name,
        addressCountry: "GB",
      },
    },
    provider: {
      "@type": "Plumber",
      name: profile?.company_name || "FixMyLeak",
      telephone: profile?.phone || "+44 7541777225",
      url: base,
    },
    url: `${base}/areas/${area.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: `Emergency Plumber ${area.name}`,
        item: `${base}/areas/${area.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AreaPage
        areaName={area.name}
        postcode={area.postcode}
        description={area.description}
        localKeywords={localKeywords}
        nearbyAreas={nearbyAreas}
      />
    </main>
  );
}
