import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Professional Plumber Battersea SW8 | Boiler Repairs & Installations | FixMyLeak",
  description: "Professional plumber in Battersea SW8. Specialising in boiler repairs, bathroom installations, and emergency plumbing for modern developments. Same-day service available.",
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
      description="Professional plumber in Battersea SW8. Specialising in boiler repairs, bathroom installations, and emergency plumbing for modern developments. Same-day service available."
      localKeywords={[
        "Professional Plumber SW8",
        "Boiler Repairs Battersea",
        "Emergency Plumber Battersea",
        "Bathroom Installations SW8",
        "Modern Developments Battersea",
        "Same-Day Service SW8"
      ]}
      nearbyAreas={[
        "Clapham",
        "Chelsea",
        "Pimlico",
        "Vauxhall",
        "Wandsworth",
        "Nine Elms"
      ]}
    />
  );
} 