import { Metadata } from "next";
import { AreaPage } from "../../../components/AreaPage";

export const metadata: Metadata = {
  title: "Reliable Plumber Streatham SW16 | Leak Detection Specialists | FixMyLeak",
  description: "Reliable plumber in Streatham SW16. Specialists in leak detection and emergency repairs. Same-day service for Streatham residents. Professional, affordable rates.",
  keywords: [
    "plumber Streatham",
    "emergency plumber Streatham",
    "leak detection Streatham SW16",
    "pipe repair Streatham",
    "boiler repair Streatham",
    "drain unblocking Streatham",
    "bathroom installation SW16",
    "gas safe engineer Streatham"
  ],
  openGraph: {
    title: "Reliable Plumber Streatham SW16 | Leak Detection Specialists | FixMyLeak",
    description: "Professional plumbing services in Streatham SW16. Leak detection specialists with same-day emergency service. Affordable rates.",
    type: "website",
    locale: "en_GB",
  },
};

export default function StreathamPage() {
  return (
    <AreaPage
      areaName="Streatham"
      postcode="SW16"
      description="Reliable plumber Streatham SW16 - Leak detection specialists serving Streatham with professional plumbing services. Our local expertise ensures fast response times and competitive rates for all your plumbing needs."
      localKeywords={[
        "Leak Detection Specialists",
        "Emergency Plumber SW16",
        "Reliable Plumber Streatham",
        "Same-Day Service Streatham",
        "Pipe Repairs SW16",
        "Boiler Service Streatham"
      ]}
      nearbyAreas={[
        "Balham",
        "Tooting",
        "Norwood",
        "Mitcham",
        "Croydon",
        "Tulse Hill"
      ]}
    />
  );
} 