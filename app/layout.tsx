import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "./providers";
import { ToastProvider } from "@/components/Toast";
import HashNavigation from "@/components/HashNavigation";
import { AdminProfileProvider } from "@/components/AdminProfileContext";

import { fontSans } from "@/config/fonts";
import LayoutMain from "@/components/LayoutMain";
import { getAdminProfile } from "@/lib/admin-profile";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  
  // Ensure years_of_experience includes "Years" if not already present
  const yearsExperience = profile?.years_of_experience 
    ? (profile.years_of_experience.toLowerCase().includes('years') 
        ? profile.years_of_experience 
        : `${profile.years_of_experience} Years`)
    : "10+ Years";

  const responseTime = profile?.response_time || "45";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'),
    title: {
      default: `${companyName} - Emergency Plumber London | Same Day Service | Clapham, Chelsea, Battersea`,
      template: `%s | ${companyName} - Emergency Plumber London`
    },
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTime}-minute response time, ${yearsExperience} experience. Gas Safe registered, fully insured.`,
    keywords: [
      "emergency plumber London",
      "plumber Clapham",
      "plumber Chelsea", 
      "plumber Battersea",
      "plumber Balham",
      "plumber Wandsworth",
      "plumber Streatham",
      "leak detection London",
      "same day plumber",
      "emergency callout London",
      "boiler repair London",
      "bathroom installation London",
      "kitchen plumbing London",
      "gas safe plumber London",
      "plumbing emergency London",
      "24 hour plumber London",
      "plumber SW4",
      "plumber SW12", 
      "plumber SW3",
      "plumber SW8",
      "plumber SW18",
      "plumber SW16",
      "fix my leak",
      "emergency plumbing services",
      "professional plumber London"
    ],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/favicon-48x48.png",
    },
    openGraph: {
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${responseTime}-minute response time. Gas Safe registered, fully insured.`,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk',
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${companyName} - Professional Emergency Plumber London`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Emergency Plumber London`,
      description: `Professional emergency plumber covering South West London with same-day service. ${responseTime}-minute response time.`,
      images: ["/og-image.png"],
      creator: "@fixmyleak",
      site: "@fixmyleak",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk',
    },
    other: {
      "geo.region": "GB-LND",
      "geo.placename": "London",
      "geo.position": "51.5074;-0.1278",
      "ICBM": "51.5074, -0.1278",
      "DC.title": `${companyName} - Emergency Plumber London`,
      "DC.description": `Professional emergency plumber covering South West London with ${responseTime}-minute response time.`,
      "DC.subject": "Emergency Plumber London, Plumbing Services, Leak Detection",
      "DC.creator": companyName,
      "DC.publisher": companyName,
      "DC.contributor": companyName,
      "DC.date": new Date().toISOString(),
      "DC.type": "Service",
      "DC.format": "text/html",
      "DC.identifier": process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk',
      "DC.language": "en",
      "DC.coverage": "South West London",
      "DC.rights": "Copyright © 2024 FixMyLeak. All rights reserved.",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch admin profile data once at the layout level
  const adminProfile = await getAdminProfile();
  
  // Create structured data for the business
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Plumber"],
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}#business`,
    "name": adminProfile?.company_name || "FixMyLeak",
    "description": `Professional emergency plumber covering South West London with ${adminProfile?.response_time || "45"}-minute response time.`,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk',
    "telephone": adminProfile?.phone || "07476 746635",
    "email": adminProfile?.business_email || "info@fixmyleak.co.uk",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressRegion": "South West London",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.5074,
      "longitude": -0.1278
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Clapham",
        "postalCode": "SW4"
      },
      {
        "@type": "City", 
        "name": "Balham",
        "postalCode": "SW12"
      },
      {
        "@type": "City",
        "name": "Chelsea", 
        "postalCode": "SW3"
      },
      {
        "@type": "City",
        "name": "Battersea",
        "postalCode": "SW8"
      },
      {
        "@type": "City",
        "name": "Wandsworth",
        "postalCode": "SW18"
      },
      {
        "@type": "City",
        "name": "Streatham",
        "postalCode": "SW16"
      }
    ],
    "serviceType": [
      "Emergency Plumbing",
      "Leak Detection",
      "Bathroom Installation", 
      "Boiler Repair",
      "Kitchen Plumbing",
      "Gas Safe Services"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification", 
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "££",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "currenciesAccepted": "GBP",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Plumbing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Plumbing",
            "description": "24/7 emergency plumbing services"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Leak Detection",
            "description": "Professional leak detection and repair"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Bathroom Installation",
            "description": "Complete bathroom installation services"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "itemReviewed": {
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}#business`
      }
    },
    "sameAs": [
      "https://www.facebook.com/fixmyleak",
      "https://www.instagram.com/fixmyleak",
      "https://www.linkedin.com/company/fixmyleak"
    ]
  };

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" href="/favicon-48x48.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/favicon-48x48.png" />
        <meta name="application-name" content="FixMyLeak" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FixMyLeak" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-K9F3CSXPFK"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K9F3CSXPFK');
            `,
          }}
        />
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          inter.className
        )}
        suppressHydrationWarning
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            enableSystem: true,
            themes: ["light", "dark"],
          }}
        >
          <ToastProvider>
            <AdminProfileProvider>
              <HashNavigation />
              <LayoutMain adminProfile={adminProfile}>{children}</LayoutMain>
            </AdminProfileProvider>
          </ToastProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
