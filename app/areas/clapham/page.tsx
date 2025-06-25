import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Emergency Plumber Clapham SW4 | Leak Detection & Repairs | FixMyLeak",
  description: "Professional emergency plumber in Clapham SW4. Same-day leak detection, pipe repairs, and emergency callouts. 45-minute response time. Call 07476 746635 now!",
  keywords: [
    "plumber Clapham",
    "emergency plumber Clapham",
    "leak detection Clapham",
    "pipe repair Clapham SW4",
    "boiler repair Clapham",
    "drain unblocking Clapham",
    "bathroom installation Clapham",
    "24/7 plumber SW4"
  ],
  openGraph: {
    title: "Emergency Plumber Clapham SW4 | Same Day Service | FixMyLeak",
    description: "Professional plumbing services in Clapham. Emergency callouts, leak detection, and repairs. 45-minute response time guaranteed.",
    type: "website",
    locale: "en_GB",
  },
};

export default function ClaphamPage() {
  return (
    <AreaPage
      areaName="Clapham"
      postcode="SW4"
      description="Looking for a trusted plumber in Clapham? FixMyLeak offers fast response times, advanced leak detection, and emergency plumbing services throughout SW4 and the local area. Our Gas Safe registered engineer provides same-day solutions for all your plumbing needs."
      localKeywords={[
        "Leak Detection Clapham",
        "Emergency Plumber SW4",
        "Pipe Repairs Clapham",
        "Boiler Service Clapham",
        "Drain Unblocking SW4",
        "Bathroom Installation Clapham"
      ]}
      nearbyAreas={[
        "Balham",
        "Stockwell", 
        "Brixton",
        "Battersea",
        "Wandsworth",
        "Oval"
      ]}
    />
  );
} 