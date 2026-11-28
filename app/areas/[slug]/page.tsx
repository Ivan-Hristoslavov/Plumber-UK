import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AreaPage } from "@/components/AreaPage";
import { getAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";
import { responseTimeMinutes } from "@/lib/response-time";
import { BRAND_NAME } from "@/lib/brand";
import { getAreaContent } from "@/lib/area-content";
import { getActiveServices } from "@/lib/services";

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
  const companyName = BRAND_NAME;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const responseTime = responseTimeMinutes(area.response_time || profile?.response_time);

  // Root layout applies a `%s | <company>` template; the combined title stays
  // under ~60 characters so it is not truncated in search results.
  // Leak detection leads: it is what people in these areas search for most
  // (Search Console), and boilers are left out because the site does not
  // claim gas work.
  const title = `Plumber & Leak Detection ${area.name} ${area.postcode}`;
  const description = `Local plumber in ${area.name} (${area.postcode}): hidden leaks found and fixed, blocked drains, taps, toilets and showers. Typical ${responseTime}-minute response. Book online or call.`;

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

  const content = getAreaContent(area.slug, area.name, area.postcode);
  const responseMinutes = responseTimeMinutes(area.response_time || profile?.response_time);
  const services = await getActiveServices().catch(() => []);
  const fromPrice = (slug: string) => {
    const price = services.find((s) => s.slug === slug)?.price;
    return price !== null && price !== undefined ? `from £${price}` : null;
  };
  const prices = { leakDetection: fromPrice("leak-detection") };

  const places = content.neighbourhoods.length ? content.neighbourhoods.join(", ") : area.name;
  const priceParts = [
    prices.leakDetection && `leak detection starts ${prices.leakDetection}`,
  ].filter(Boolean) as string[];
  const priceSentence = priceParts.length
    ? `${priceParts.join(" and ").replace(/^./, (c) => c.toUpperCase())}. `
    : "";
  const faqs = [
    {
      question: `Do you cover all of ${area.name}?`,
      answer: `Yes. We work across ${area.name} (${content.postcodes.join(", ") || area.postcode}), including ${places}, and the neighbouring areas.`,
    },
    {
      question: `How quickly can you get to me in ${area.name}?`,
      answer: `Our typical response time in ${area.name} is around ${responseMinutes} minutes for urgent jobs. For other jobs you can book a time online that suits you.`,
    },
    {
      question: "Can you find a hidden leak without ripping up floors?",
      answer:
        "We trace the leak to its source first, so only the spot that needs it is opened up. Damp patches, stains on the ceiling below, a meter that keeps moving or a higher water bill are the usual signs.",
    },
    {
      question: `How much does a plumber in ${area.name} cost?`,
      answer: `${priceSentence}You are told the price before any work starts, and there is nothing to pay upfront when you book.`,
    },
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Plumbing and leak detection",
    name: `Plumber & Leak Detection in ${area.name}`,
    description: content.intro[0],
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
      name: BRAND_NAME,
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
      { "@type": "ListItem", position: 2, name: "Areas We Cover", item: `${base}/areas` },
      {
        "@type": "ListItem",
        position: 3,
        name: `Plumber ${area.name}`,
        item: `${base}/areas/${area.slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AreaPage
        areaName={area.name}
        postcode={area.postcode}
        responseMinutes={responseMinutes}
        content={content}
        faqs={faqs}
        prices={prices}
        nearbyAreas={nearbyAreas}
      />
    </main>
  );
}
