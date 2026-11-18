import type { Metadata } from 'next';
import Image from "next/image";
import dynamic from "next/dynamic";
import { SectionHero } from "@/components/SectionHero";
import { SectionPricing } from "@/components/SectionPricing";
import { AdminProfileData } from "@/components/AdminProfileData";

import SectionContact from "@/components/SectionContact";
import { getAdminProfile } from "@/lib/admin-profile";
import { renderMarkdownToHtml } from "@/lib/render-markdown";
import { responseTimeMinutes } from "@/lib/response-time";
import { createClient } from "@/lib/supabase/server";
import { BRAND_NAME } from "@/lib/brand";
import { AboutExpandable } from "@/components/AboutExpandable";
import { ProfileListWithShowMore } from "@/components/ProfileListWithShowMore";
import { SectionCoverage } from "@/components/SectionCoverage";
import { getActiveServices } from "@/lib/services";
import { getAvailability } from "@/lib/availability";
import { credentialsSentence, getPublicCredentials } from "@/lib/credentials";
import { getFoundingConfig } from "@/lib/founding-server";
import { FAQSection } from "@/components/FAQSection";
import { ReviewsSection } from "@/components/ReviewsSection";

const GallerySection = dynamic(() => import("@/components/GallerySection").then(m => m.GallerySection), {
  loading: () => (
    <section className="py-12 sm:py-16 md:py-24 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 sm:w-64 mx-auto mb-4" />
          <div className="h-64 sm:h-80 md:h-96 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </section>
  ),
});

interface Area {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const credentials = credentialsSentence(await getPublicCredentials());
  const companyName = BRAND_NAME;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk';
  
  const responseTimeNormalized = responseTimeMinutes(profile?.response_time);

  const yearsExperience = profile?.years_of_experience 
    ? (profile.years_of_experience.toLowerCase().includes('years') 
        ? profile.years_of_experience 
        : `${profile.years_of_experience} Years`)
    : "10+ Years";

  return {
    title: `${companyName} - Emergency Plumber London | Same Day Service | Clapham, Chelsea, Battersea`,
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTimeNormalized}-minute response time, ${yearsExperience} experience. Free call consultation.${credentials}`,
    alternates: {
      canonical: base,
    },
    openGraph: {
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${responseTimeNormalized}-minute response time. Free call consultation.${credentials}`,
      url: base,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      images: [
        {
          url: "/fix_my_leak_logo.jpg",
          width: 1200,
          height: 630,
          alt: `${companyName} - Professional Emergency Plumber London`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Emergency Plumber London`,
      description: `Professional emergency plumber covering South West London with same-day service. ${responseTimeNormalized}-minute response time. Free call consultation.`,
      images: ["/fix_my_leak_logo.jpg"],
    },
  };
}

async function getAreas(): Promise<Area[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admin_areas_cover')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (error) {
      return [];
    }
    
    return data || [];
  } catch {
    return [];
  }
}

// The FAQ and reviews sections are client-fetched, so their content never
// reaches a crawler as markup it can summarise. Reading the same rows here lets
// us emit matching JSON-LD, which is what earns the expandable FAQ result and
// review stars.
async function getFaqAndReviews() {
  try {
    const supabase = createClient();
    const [{ data: faqItems }, { data: reviews }, { data: allRatings }, { data: pricingCards }] = await Promise.all([
      supabase
        .from('faq')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true }),
      // Review markup only needs a representative sample of the text.
      supabase
        .from('reviews')
        .select('id, customer_name, rating, comment, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20),
      // The rating summary must cover every approved review, or the count shown
      // beside the headline contradicts the aggregateRating in the markup.
      supabase
        .from('reviews')
        .select('rating')
        .eq('is_approved', true),
      supabase
        .from('pricing_cards')
        .select('*')
        .eq('is_enabled', true)
        .order('order', { ascending: true }),
    ]);

    return {
      faqItems: faqItems || [],
      reviews: reviews || [],
      allRatings: allRatings || [],
      pricingCards: pricingCards || [],
    };
  } catch {
    return { faqItems: [], reviews: [], allRatings: [], pricingCards: [] };
  }
}

export default async function HomePage() {
  const [areas, profile, { faqItems, reviews, allRatings, pricingCards }, services, availability, foundingConfig] = await Promise.all([
    getAreas(),
    getAdminProfile(),
    getFaqAndReviews(),
    getActiveServices(),
    getAvailability(),
    getFoundingConfig(),
  ]);

  // Same figures the aggregateRating markup uses, surfaced next to the headline
  // where they can actually influence the decision to call.
  const ratingValues = allRatings
    .map((r: { rating: number }) => Number(r.rating))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  const rating =
    ratingValues.length > 0
      ? {
          average: ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length,
          count: ratingValues.length,
        }
      : null;
  const aboutHtml = profile?.about ? renderMarkdownToHtml(profile.about) : "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk';
  const businessName = BRAND_NAME;
  const responseTimeNormalized = responseTimeMinutes(profile?.response_time);

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : null;

  const reviewSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${base}#business`,
    name: businessName,
    review: reviews.map((r: { customer_name: string; rating: number; comment: string; created_at: string }) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.comment,
      datePublished: r.created_at?.slice(0, 10),
    })),
  } : null;

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}
      {/* Hero Section */}
      <SectionHero availability={availability} rating={rating} areas={areas} foundingLimit={foundingConfig.limit} />

      {/* Services Section */}
      <section id="services">
        <SectionPricing initialCards={pricingCards} />
      </section>
      {/* Our Story / About Section — id="about" anchor so nav #about scrolls here */}
      <section
        className="py-10 sm:py-14 bg-gray-100 dark:bg-gray-900 transition-colors duration-500 scroll-mt-24 relative"
        id="our-story"
      >
        <span id="about" className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-6 lg:gap-12 items-start">
            {/* Large portrait on a computer only. On a phone it took most of a
                screen before any text; there the face sits beside the name. */}
            <div className="hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 aspect-[4/5]">
                <Image
                  src="/plamen.jpeg"
                  alt={`${profile?.name || "Plamen Zhelev"}, founder and lead plumbing engineer`}
                  width={600}
                  height={750}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300 mb-2">
                About us
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Professional plumbing you can trust
              </h2>

              {/* Who: face, name, role and the two numbers people look for. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/plamen.jpeg"
                    alt=""
                    width={112}
                    height={112}
                    className="h-14 w-14 rounded-full object-cover object-top ring-2 ring-white shadow-md dark:ring-gray-800 lg:hidden"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{profile?.name || "Plamen Zhelev"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Founder &amp; plumbing engineer</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700">
                    <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <AdminProfileData type="years_of_experience" fallback="10+ Years" />
                    <span className="font-normal text-gray-500 dark:text-gray-400">experience</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700">
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    {responseTimeNormalized} min
                    <span className="font-normal text-gray-500 dark:text-gray-400">response</span>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <AboutExpandable aboutHtml={aboutHtml} />
              </div>

              {/* Credentials as tags in one card, two columns on larger screens. */}
              <div className="mt-5 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 sm:p-5">
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Certifications
                  </h3>
                  <ProfileListWithShowMore
                    value={profile?.certifications}
                    fallback="Kitchen plumbing specialist. Registered professional with City & Guilds Level 3 in Plumbing & Heating. Holder of CSCS JIB Gold Card."
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Areas of expertise
                  </h3>
                  <ProfileListWithShowMore
                    value={profile?.specializations}
                    fallback="Emergency plumbing. Bathroom plumbing & repairs. Leak detection"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionCoverage
        areas={areas.map((a) => ({ name: a.name, slug: a.slug, postcode: a.postcode }))}
        services={services.map((s) => ({ name: s.name, slug: s.slug, price: s.price }))}
      />

      {/* Gallery Section */}
      <GallerySection />

      {/* FAQ Section */}
      <FAQSection initialItems={faqItems} />

      {/* Reviews Section */}
      <ReviewsSection initialReviews={reviews} />

      {/* Contact Section */}
      <SectionContact />
    </main>
  );
}
