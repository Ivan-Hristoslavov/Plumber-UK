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
const FAQSection = dynamic(() => import("@/components/FAQSection").then(m => m.FAQSection), {
  loading: () => (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-gray-600 dark:text-gray-300">Loading FAQ...</div>
      </div>
    </section>
  ),
});
const ReviewsSection = dynamic(() => import("@/components/ReviewsSection").then(m => m.ReviewsSection), {
  loading: () => (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-gray-600 dark:text-gray-300">Loading reviews...</div>
      </div>
    </section>
  ),
});
const ReviewForm = dynamic(() => import("@/components/ReviewForm").then(m => m.ReviewForm), {
  loading: () => (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-gray-600 dark:text-gray-300">Loading review form...</div>
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
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTimeNormalized}-minute response time, ${yearsExperience} experience. Free call consultation. Gas Safe registered, fully insured.`,
    alternates: {
      canonical: base,
    },
    openGraph: {
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${responseTimeNormalized}-minute response time. Free call consultation. Gas Safe registered, fully insured.`,
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
    const [{ data: faqItems }, { data: reviews }] = await Promise.all([
      supabase
        .from('faq')
        .select('question, answer')
        .eq('is_active', true)
        .order('order', { ascending: true }),
      supabase
        .from('reviews')
        .select('customer_name, rating, comment, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    return { faqItems: faqItems || [], reviews: reviews || [] };
  } catch {
    return { faqItems: [], reviews: [] };
  }
}

export default async function HomePage() {
  const [areas, profile, { faqItems, reviews }, services] = await Promise.all([
    getAreas(),
    getAdminProfile(),
    getFaqAndReviews(),
    getActiveServices(),
  ]);
  const aboutHtml = profile?.about ? renderMarkdownToHtml(profile.about) : "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk';
  const businessName = BRAND_NAME;
  const businessPhone = profile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");
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
      <SectionHero />

      {/* Services Section */}
      <section id="services">
        <SectionPricing />
      </section>
      {/* Our Story / About Section — id="about" anchor so nav #about scrolls here */}
      <section
        className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500 scroll-mt-24 relative"
        id="our-story"
      >
        <span id="about" className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Portrait beside the copy rather than a centred square above it — the
              stacked version pushed the actual text most of a screen down. */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
            <div className="mx-auto lg:mx-0 w-full max-w-sm">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 aspect-[4/5]">
                  <Image
                    src="/plamen.jpeg"
                    alt={`${profile?.name || "Plamen Zhelev"}, founder and lead plumbing engineer`}
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>

                <div className="absolute -bottom-5 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-3">
                  <div className="font-bold text-gray-900 dark:text-white leading-tight">
                    {profile?.name || "Plamen Zhelev"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Founder &amp; lead engineer
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 lg:pt-0">
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase mb-4">
                About Us
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Professional Plumbing Services You Can Trust
              </h2>

              <div className="mb-8">
                <AboutExpandable aboutHtml={aboutHtml} />
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Experience
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    <AdminProfileData type="years_of_experience" fallback="10+ Years" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Response
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {responseTimeNormalized} minutes
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 col-span-2 sm:col-span-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Certifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <ProfileListWithShowMore
                      value={profile?.certifications}
                      fallback="Kitchen plumbing specialist. Registered professional with City & Guilds Level 3 in Plumbing & Heating. Holder of CSCS JIB Gold Card."
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 col-span-2 sm:col-span-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Areas of Expertise
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <ProfileListWithShowMore
                      value={profile?.specializations}
                      fallback="Emergency plumbing. Bathroom plumbing & repairs. Leak detection"
                    />
                  </div>
                </div>
              </div>

              {/* Same call-first pairing as the hero, rather than a third
                  differently-styled gradient button. */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${businessPhone}`}
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  Call {displayPhone}
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Get a Free Quote
                </a>
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
      <FAQSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Contact Section */}
      <SectionContact />

      {/* Review Form Section */}
      <ReviewForm />
    </main>
  );
}
