import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServicePage } from "@/components/ServicePage";
import { getAdminProfile } from "@/lib/admin-profile";
import { getActiveServices } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { responseTimeMinutes } from "@/lib/response-time";
import { BRAND_NAME } from "@/lib/brand";

export const revalidate = 3600;

async function getAreas() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("admin_areas_cover")
      .select("name, slug, postcode")
      .eq("is_active", true)
      .order("order", { ascending: true });

    return data || [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const services = await getActiveServices();

  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const services = await getActiveServices();
  const service = services.find((s) => s.slug === slug);

  if (!service) return {};

  const profile = await getAdminProfile();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const responseTime = responseTimeMinutes(profile?.response_time);
  const priceSuffix = service.price !== null ? ` From £${service.price}.` : "";

  const title = `${service.name} South West London`;
  const description = `${service.description || service.name} across Clapham, Balham, Chelsea, Battersea, Wandsworth and Streatham.${priceSuffix} ${responseTime}-minute emergency response, fully insured. Call now.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/services/${service.slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/services/${service.slug}`,
      type: "website",
      locale: "en_GB",
      siteName: BRAND_NAME,
      images: [{ url: "/fix_my_leak_logo.jpg", width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [services, areas, profile] = await Promise.all([
    getActiveServices(),
    getAreas(),
    getAdminProfile(),
  ]);
  const service = services.find((s) => s.slug === slug);

  if (!service) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const description = service.description || `Professional ${service.name.toLowerCase()} across South West London.`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: `${service.name} in South West London`,
    description,
    ...(service.price !== null && {
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
    }),
    areaServed: areas.map((area: { name: string; postcode: string }) => ({
      "@type": "City",
      name: area.name,
      address: {
        "@type": "PostalAddress",
        postalCode: area.postcode,
        addressLocality: area.name,
        addressCountry: "GB",
      },
    })),
    provider: {
      "@type": "Plumber",
      name: BRAND_NAME,
      telephone: profile?.phone || "+44 7541777225",
      url: base,
    },
    url: `${base}/services/${service.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Services", item: `${base}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `${base}/services/${service.slug}`,
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
      <ServicePage
        name={service.name}
        description={description}
        price={service.price}
        durationMinutes={service.duration_minutes}
        areas={areas}
        relatedServices={services
          .filter((s) => s.slug !== service.slug)
          .map((s) => ({ name: s.name, slug: s.slug, price: s.price }))}
      />
    </main>
  );
}
