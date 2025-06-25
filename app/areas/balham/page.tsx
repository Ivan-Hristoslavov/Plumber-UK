import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Emergency Plumber Balham SW12 | Fast Response Plumbing Services | FixMyLeak",
  description: "Professional emergency plumber in Balham SW12. 24/7 plumbing services, leak detection, and emergency repairs. Same-day service guaranteed. Call 07476 746635!",
  keywords: [
    "plumber Balham",
    "emergency plumber Balham",
    "leak detection Balham SW12",
    "pipe repair Balham",
    "boiler repair Balham",
    "drain unblocking Balham",
    "bathroom installation Balham",
    "24/7 plumber Balham"
  ],
  openGraph: {
    title: "Emergency Plumber Balham SW12 | Fast Response | FixMyLeak",
    description: "Professional plumbing services in Balham SW12. Emergency callouts available 24/7. Fast response times and competitive rates.",
    type: "website",
    locale: "en_GB",
  },
};

export default function BalhamPage() {
  return (
    <AreaPage
      areaName="Balham"
      postcode="SW12"
      description="Fast response plumbing services in Balham SW12. Our experienced plumber provides emergency callouts, leak detection, and comprehensive plumbing solutions throughout Balham and surrounding areas. Available 24/7 with competitive rates."
      localKeywords={[
        "Fast Response Balham",
        "Emergency Plumber SW12",
        "Leak Detection Balham",
        "Pipe Repairs Balham",
        "Boiler Service SW12",
        "Drain Clearing Balham"
      ]}
      nearbyAreas={[
        "Clapham",
        "Tooting",
        "Streatham",
        "Wandsworth",
        "Earlsfield",
        "Wimbledon"
      ]}
    />
  );
} 