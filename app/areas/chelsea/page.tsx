import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Premium Plumber Chelsea SW3 | Luxury Property Specialists | FixMyLeak",
  description: "Premium plumbing services for Chelsea SW3 properties. Specialist in luxury installations, emergency repairs, and high-end bathroom fittings. Discreet professional service.",
  keywords: [
    "plumber Chelsea",
    "premium plumber Chelsea",
    "luxury plumber SW3",
    "emergency plumber Chelsea",
    "bathroom installation Chelsea",
    "boiler repair Chelsea SW3",
    "leak detection Chelsea",
    "high-end plumbing Chelsea"
  ],
  openGraph: {
    title: "Premium Plumber Chelsea SW3 | Luxury Property Specialists | FixMyLeak",
    description: "Specialist plumbing services for luxury Chelsea properties. High-end installations and emergency repairs with discreet professional service.",
    type: "website",
    locale: "en_GB",
  },
};

export default function ChelseaPage() {
  return (
    <AreaPage
      areaName="Chelsea"
      postcode="SW3"
      description="Premium plumber Chelsea SW3 - Specialist in luxury bathroom installations and high-end property maintenance. Our discreet professional service caters to Chelsea's prestigious homes and developments. Experience with premium fittings and designer installations."
      localKeywords={[
        "Premium Plumber Chelsea",
        "Luxury Installations SW3",
        "Designer Bathrooms Chelsea",
        "High-End Repairs Chelsea",
        "Emergency Plumber SW3",
        "Boiler Service Chelsea"
      ]}
      nearbyAreas={[
        "Belgravia",
        "Knightsbridge",
        "South Kensington",
        "Fulham",
        "Pimlico",
        "Sloane Square"
      ]}
    />
  );
} 