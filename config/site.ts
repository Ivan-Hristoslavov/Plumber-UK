export type SiteConfig = typeof siteConfig;

// The business's real Google Business Profile ("FixMyLeak", 07541 777225).
// There is a second, unrelated listing ("PZ Plumber Limited", Mitcham, ~7
// reviews) that is NOT this business, so never link to that one.
const GOOGLE_PLACE_ID = "ChIJZ1bnK9629gcRDI3CBBY66SE";
const GOOGLE_CID = "2443548139068755212";

export const googleBusiness = {
  placeId: GOOGLE_PLACE_ID,
  // Opens the profile with all its reviews.
  profileUrl: `https://www.google.com/maps?cid=${GOOGLE_CID}`,
  // Opens the "write a review" box straight away.
  writeReviewUrl: `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`,
  // Pin of the profile, so the site and Google describe the same place.
  latitude: 51.4485528,
  longitude: -0.1605524,
};

export const siteConfig = {
  name: "FIX MY LEAK",
  description:
    "Professional plumbing services across South West London. Emergency plumber covering Clapham, Balham, Chelsea, Battersea, Wandsworth, and Streatham with 45-minute response times.",
  links: {
    phone: "+44 7541777225",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@fixmyleak.co.uk",
  },
  areas: [
    {
      name: "Clapham",
      slug: "clapham",
      postcode: "SW4"
    },
    {
      name: "Balham", 
      slug: "balham",
      postcode: "SW12"
    },
    {
      name: "Chelsea",
      slug: "chelsea", 
      postcode: "SW3"
    },
    {
      name: "Battersea",
      slug: "battersea",
      postcode: "SW8"
    },
    {
      name: "Wandsworth",
      slug: "wandsworth",
      postcode: "SW18"
    },
    {
      name: "Streatham",
      slug: "streatham",
      postcode: "SW16"
    }
  ],
};
