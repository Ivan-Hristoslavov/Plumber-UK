import type { Metadata } from 'next';
import Image from "next/image";
import dynamic from "next/dynamic";
import { SectionHero } from "@/components/SectionHero";
import { SectionPricing } from "@/components/SectionPricing";
import { AdminProfileData } from "@/components/AdminProfileData";

import SectionContact from "@/components/SectionContact";
import { FloatingCTA } from "@/components/FloatingCTA";
import { getAdminProfile } from "@/lib/admin-profile";
import { renderMarkdownToHtml } from "@/lib/render-markdown";
import { createClient } from "@/lib/supabase/server";
import { AboutExpandable } from "@/components/AboutExpandable";
import { ProfileListWithShowMore } from "@/components/ProfileListWithShowMore";

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
  const companyName = profile?.company_name || "FixMyLeak";
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk';
  
  const responseTime = profile?.response_time || "45 minutes";
  // Normalize response time to avoid duplication (remove any existing "minute/minutes")
  const responseTimeNormalized = responseTime.replace(/\s+(minutes?|mins?)\s*/gi, '').trim();
  
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

export default async function HomePage() {
  const [areas, profile] = await Promise.all([getAreas(), getAdminProfile()]);
  const aboutHtml = profile?.about ? renderMarkdownToHtml(profile.about) : "";

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium mb-3 sm:mb-6">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              About Us
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Professional Plumbing Services You Can Trust
            </h2>
          </div>

          {/* Main Content - Centered Layout */}
          <div className="max-w-6xl mx-auto">
            {/* Profile Image - Centered */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/plamen.jpeg"
                    alt="Professional Plumber at work"
                    width={600}
                    height={600}
                    className="w-[28rem] h-[28rem] object-cover"
                    priority
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-500 rounded-full opacity-20"></div>
              </div>
            </div>

            {/* About Text - FAQ-style expandable (same pattern as FAQ, works in Safari) */}
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-600 px-6 py-6 sm:px-8 sm:py-8 overflow-hidden transition-all duration-500 hover:shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-full translate-y-12 -translate-x-12" />
                <div className="relative z-10">
                  <AboutExpandable aboutHtml={aboutHtml} />
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {/* Experience */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-200 dark:hover:border-green-800 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      <AdminProfileData type="years_of_experience" fallback="10+ Years" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      <AdminProfileData type="response_time" fallback="45 Minutes Response Time" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Certifications</h3>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <ProfileListWithShowMore
                      value={profile?.certifications}
                      fallback="Kitchen plumbing specialist. Registered professional with City & Guilds Level 3 in Plumbing & Heating. Holder of CSCS JIB Gold Card."
                    />
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-xl transition-all duration-300 hover:border-amber-200 dark:hover:border-amber-800 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Specializations</h3>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <ProfileListWithShowMore
                      value={profile?.specializations}
                      fallback="Emergency plumbing. Bathroom plumbing & repairs. Leak detection"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <a
                href="#contact"
                className="group inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-blue-500/20"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>
      
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

      {/* Floating Elements */}
      <FloatingCTA />
    </main>
  );
}
