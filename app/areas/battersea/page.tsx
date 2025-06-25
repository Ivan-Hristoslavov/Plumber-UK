import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Professional Plumber Battersea SW8 | Boiler Repairs & Installations | FixMyLeak",
  description: "Professional plumber in Battersea SW8. Specializing in boiler repairs, bathroom installations, and emergency plumbing for modern developments. Same-day service available.",
  keywords: [
    "plumber Battersea",
    "emergency plumber Battersea",
    "boiler repair Battersea SW8",
    "bathroom installation Battersea",
    "leak detection Battersea",
    "pipe repair Battersea",
    "drain unblocking SW8",
    "plumber Nine Elms"
  ],
  openGraph: {
    title: "Professional Plumber Battersea SW8 | Boiler & Bathroom Specialists | FixMyLeak",
    description: "Expert plumbing services in Battersea SW8. Boiler repairs, bathroom installations, and emergency callouts for residential developments.",
    type: "website",
    locale: "en_GB",
  },
};

export default function BatterseaPage() {
  return (
    <AreaPage
      areaName="Battersea"
      postcode="SW8"
      description="Professional plumber Battersea SW8 - Expert in boiler repairs and installations for Battersea's modern residential developments. Our comprehensive plumbing services cover everything from emergency repairs to complete bathroom renovations."
      localKeywords={[
        "Boiler Repairs Battersea",
        "Emergency Plumber SW8",
        "Bathroom Installation Battersea",
        "Modern Development Plumber",
        "Leak Detection Battersea",
        "Central Heating SW8"
      ]}
      nearbyAreas={[
        "Nine Elms",
        "Clapham",
        "Wandsworth",
        "Chelsea",
        "Vauxhall",
        "Stockwell"
      ]}
    />
  );
} 