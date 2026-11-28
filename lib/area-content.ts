/**
 * Local copy for each area page, so every page says something true and
 * specific about that area instead of the same paragraph with the name
 * swapped (Google tends to leave near-identical pages out of its index).
 *
 * Only general, checkable facts about the areas (neighbourhoods, housing) and
 * the services the business lists on the site. No invented jobs, customers or
 * claims. Areas added in the admin without an entry here still get a page,
 * built from the generic copy at the bottom.
 */

export type AreaContent = {
  /** Postcodes and neighbourhoods people search by. */
  neighbourhoods: string[];
  postcodes: string[];
  /** Two short paragraphs about the area's homes and the plumbing they need. */
  intro: [string, string];
  /** The leak problem most typical for the housing there. */
  leakNote: string;
};

const AREAS: Record<string, AreaContent> = {
  balham: {
    postcodes: ["SW12", "SW17"],
    neighbourhoods: ["Balham High Road", "Nightingale Triangle", "Heaver Estate", "Du Cane Court", "Balham Park", "Bedford Hill"],
    intro: [
      "Balham is mostly Victorian and Edwardian terraces, many split into flats, alongside large mansion blocks such as Du Cane Court. Older homes here often still have original pipework hidden under suspended timber floors and inside walls.",
      "We handle leaks, blocked drains and waste pipes, tap and toilet repairs, shower problems and low water pressure across Balham, from the streets around the station to the Heaver Estate and the Nightingale Triangle.",
    ],
    leakNote:
      "In converted flats a small leak under the floor often shows up first as a stain on the ceiling of the flat below, so finding the source quickly matters for both neighbours.",
  },
  battersea: {
    postcodes: ["SW8", "SW11"],
    neighbourhoods: ["Battersea Park", "Nine Elms", "Battersea Power Station", "Shaftesbury Park Estate", "Clapham Junction", "Northcote Road"],
    intro: [
      "Battersea mixes Victorian cottages and terraces, like the Shaftesbury Park Estate and the streets around Northcote Road, with large new developments at Nine Elms and Battersea Power Station.",
      "We fix leaks, blocked drains, taps, toilets and showers, sort out water pressure problems and fit washing machines and dishwashers in Battersea homes of every age, from period houses to new-build apartments.",
    ],
    leakNote:
      "In new-build flats most pipework runs behind boxing and walls, so a leak is usually traced to its source first and only then opened up, to keep damage to finishes small.",
  },
  clapham: {
    postcodes: ["SW4", "SW11"],
    neighbourhoods: ["Clapham Common", "Clapham Old Town", "Clapham North", "Clapham High Street", "Abbeville Village", "Clapham Junction"],
    intro: [
      "Clapham has Georgian and Victorian houses around Clapham Common and the Old Town, plenty of them converted into flats, plus terraces off Clapham High Street and around Abbeville Village.",
      "We cover leak detection and repairs, blocked drains and waste pipes, tap, toilet and shower repairs and low water pressure across Clapham, with same-day call-outs for burst pipes and leaks that cannot wait.",
    ],
    leakNote:
      "Older Clapham houses can still have lead or very old copper supply pipes, which are worth checking when a leak keeps coming back in the same place.",
  },
  streatham: {
    postcodes: ["SW16", "SW2"],
    neighbourhoods: ["Streatham High Road", "Streatham Hill", "Streatham Common", "Telford Park", "Streatham Vale", "Norbury"],
    intro: [
      "Streatham runs from Edwardian houses and mansion blocks around Streatham Hill and Telford Park to the 1930s semis of Streatham Vale, close to where we are based.",
      "In Streatham we cover leak detection and repairs, blocked drains, taps, toilets, showers, water pressure problems and appliance installations, with same-day call-outs when a leak cannot wait.",
    ],
    leakNote:
      "In 1930s houses the original pipework is now close to a hundred years old, and slow leaks under floors or behind kitchen units are common before anyone notices damp.",
  },
  wandsworth: {
    postcodes: ["SW18", "SW17"],
    neighbourhoods: ["Wandsworth Town", "Wandsworth Common", "The Toast Rack", "Southfields", "Earlsfield", "Riverside Quarter"],
    intro: [
      "Wandsworth has rows of Victorian and Edwardian terraces around Wandsworth Common, Southfields and Earlsfield, and newer riverside apartments near Wandsworth Town.",
      "We fix leaks, blocked drains and waste pipes, taps, toilets and showers, sort out low water pressure and fit washing machines and dishwashers across Wandsworth.",
    ],
    leakNote:
      "London's hard water leaves limescale in taps, valves and shower mixers, which is a frequent cause of drips and weak showers in Wandsworth homes.",
  },
  chelsea: {
    postcodes: ["SW3", "SW10"],
    neighbourhoods: ["King's Road", "Sloane Square", "Chelsea Embankment", "Chelsea Green", "The Vale", "World's End"],
    intro: [
      "Chelsea is period townhouses, mews houses and mansion blocks around the King's Road, Sloane Square and the Embankment, many with converted basements and high-spec bathrooms.",
      "We carry out leak detection and repairs, shower and tap work, toilet repairs and blocked drains and waste pipes in Chelsea, working carefully around fitted kitchens, stone and tiled finishes.",
    ],
    leakNote:
      "In mansion blocks a leak can affect several flats at once, so we locate the source first and keep opening up of finished walls and floors to a minimum.",
  },
};

export function getAreaContent(slug: string, name: string, postcode: string): AreaContent {
  return (
    AREAS[slug] ?? {
      postcodes: postcode ? [postcode] : [],
      neighbourhoods: [],
      intro: [
        `We cover homes across ${name}${postcode ? ` (${postcode})` : ""}, from period terraces and converted flats to newer apartments.`,
        `We fix leaks, blocked drains and waste pipes, taps, toilets and showers, sort out low water pressure and fit washing machines and dishwashers in ${name}.`,
      ],
      leakNote: "A slow hidden leak often shows first as damp, a stain or a higher water bill, so it is worth finding early.",
    }
  );
}

/** The services the business lists on the site, for every area page. */
export const AREA_SERVICES: { title: string; text: string; href?: string }[] = [
  { title: "Leak detection", text: "Finding hidden leaks under floors and behind walls, with pipe tracing, before anything is opened up.", href: "/services/leak-detection" },
  { title: "Leak repairs", text: "Repairs to leaking pipes, joints, valves, tanks and appliances, and making good afterwards.", href: "/services/leak-detection" },
  { title: "Same-day repairs", text: "Same-day call-outs for burst pipes, overflowing toilets and leaks that cannot wait." },
  { title: "Blocked drains & waste", text: "Blocked sinks, basins, baths, showers and toilets, and slow or smelly waste pipes." },
  { title: "Taps, toilets & showers", text: "Dripping taps, running or leaking toilets, shower repairs and replacements." },
  { title: "Water pressure & appliances", text: "Low pressure problems, and washing machine and dishwasher installation." },
];
