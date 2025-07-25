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

  return {
    title: `${companyName} - Emergency Plumber London | Same Day Service | Clapham, Chelsea, Battersea`,
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham, ${profile?.response_time}-minute response time, ${profile?.years_of_experience}+ years experience.`,
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
    ],
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${profile?.response_time}-minute response time.`,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Emergency Plumber London`,
      description: `Professional emergency plumber covering South West London with same-day service.`,
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

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          inter.className
        )}
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
