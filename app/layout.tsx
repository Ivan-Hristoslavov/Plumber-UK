import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Inter } from "next/font/google";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import LayoutMain from "@/components/LayoutMain";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIX MY LEAK - Professional Plumbing Services",
  description:
    "Professional plumbing services available 24/7 across the United Kingdom.",
  keywords:
    "plumbing, UK, emergency plumbing, professional plumber, plumbing services",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          inter.className,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <LayoutMain>{children}</LayoutMain>
        </Providers>
      </body>
    </html>
  );
}
