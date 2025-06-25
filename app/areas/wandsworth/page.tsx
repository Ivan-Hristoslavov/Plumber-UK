import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Trusted Plumbing Services Wandsworth SW18 | Emergency Callouts | FixMyLeak",
  description: "Trusted plumber in Wandsworth SW18. Emergency callouts, leak detection, and comprehensive plumbing services for Wandsworth homes and businesses. Available 24/7.",
  keywords: [
    "plumber Wandsworth",
    "emergency plumber Wandsworth",
    "leak detection Wandsworth SW18",
    "pipe repair Wandsworth",
    "boiler service Wandsworth",
    "drain unblocking Wandsworth",
    "bathroom plumber SW18",
    "central heating Wandsworth"
  ],
  openGraph: {
    title: "Trusted Plumber Wandsworth SW18 | Emergency Services | FixMyLeak",
    description: "Reliable plumbing services in Wandsworth SW18. Emergency callouts and comprehensive plumbing solutions for homes and businesses.",
    type: "website",
    locale: "en_GB",
  },
};

export default function WandsworthPage() {
  return (
    <AreaPage
      areaName="Wandsworth"
      postcode="SW18"
      description="Trusted plumbing services Wandsworth SW18 - Your reliable local plumber for emergency callouts and comprehensive plumbing solutions. Serving Wandsworth residents and businesses with professional, affordable plumbing services."
      localKeywords={[
        "Trusted Plumber Wandsworth",
        "Emergency Callouts SW18",
        "Leak Detection Wandsworth",
        "Pipe Repairs Wandsworth",
        "Boiler Service SW18",
        "Comprehensive Plumbing"
      ]}
      nearbyAreas={[
        "Putney",
        "Balham",
        "Clapham",
        "Battersea",
        "Earlsfield",
        "East Putney"
      ]}
    />
  );
} 