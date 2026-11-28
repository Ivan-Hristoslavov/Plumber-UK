/**
 * Longer copy for the service pages, keyed by the service slug (from the
 * admin's service name). Written around what people actually search for in
 * Search Console ("leak detection <area>", "leak repair", "emergency leak
 * repair", "bathroom leak repair") and limited to work the business lists on
 * the site. Services without an entry keep the short admin description only.
 */

export type ServiceContent = {
  /** Replaces "<name> South West London" in the page title when set. */
  title?: string;
  intro: string[];
  covers: string[];
  faqs: { question: string; answer: string }[];
};

const CONTENT: Record<string, ServiceContent> = {
  "leak-detection": {
    title: "Leak Detection & Leak Repair South West London",
    intro: [
      "A leak you cannot see is still costing you: water through the ceiling, a damp patch that keeps spreading, a meter that turns when every tap is off, or a water bill that suddenly jumps.",
      "We trace the leak to its source with pipe tracing and careful checks before anything is opened up, then repair it, so you are not paying for floors and walls to be taken apart to find it. Leak repairs and making good are part of the same job.",
    ],
    covers: [
      "Leaks under floors and behind walls",
      "Water coming through the ceiling from the flat or bathroom above",
      "Bathroom and shower leaks, including around trays and seals",
      "Leaking pipes, joints, valves and stopcocks",
      "Leaks from toilets, cisterns, taps and appliances",
      "Hot water cylinder and pipework leaks",
    ],
    faqs: [
      {
        question: "How do I know if I have a hidden leak?",
        answer:
          "Common signs are a damp patch or stain, peeling paint, a musty smell, water through the ceiling below a bathroom, low water pressure, or a water meter that keeps moving when nothing is running.",
      },
      {
        question: "Do you have to rip up floors to find a leak?",
        answer:
          "No. We trace the leak first so only the spot that needs it is opened up, which keeps the repair smaller and cheaper.",
      },
      {
        question: "Can you repair the leak on the same visit?",
        answer:
          "Where we can, yes. Most pipe, joint, valve and fitting repairs are done once the leak is found. If a part has to be ordered we make the area safe and come back.",
      },
      {
        question: "Water is coming through my ceiling. What should I do now?",
        answer:
          "Turn off the water at the stopcock, switch off electrics near the leak if it is safe to do so, catch the water and call us. We treat it as urgent.",
      },
    ],
  },
  "emergency-plumber": {
    intro: [
      "Burst pipe, water through the ceiling, an overflowing toilet or no water at all: call and we come out the same day, with a typical response of around 45 minutes across South West London.",
      "We stop the leak first, make the area safe and then fix the cause, so you are not left with a temporary repair.",
    ],
    covers: [
      "Burst and leaking pipes",
      "Water coming through ceilings",
      "Overflowing or constantly running toilets",
      "Blocked toilets, sinks, baths and showers",
      "Leaking taps, valves and stopcocks that will not turn off",
      "Loss of water or very low pressure",
    ],
    faqs: [
      {
        question: "What should I do while I wait for the plumber?",
        answer:
          "Turn off the water at the stopcock (usually under the kitchen sink or where the pipe enters the house), turn off electrics near the leak if safe, and move valuables away from the water.",
      },
      {
        question: "How fast can you get to me?",
        answer:
          "Our typical response for urgent jobs is around 45 minutes across the areas we cover. Call rather than book online when it is urgent.",
      },
      {
        question: "Do you charge a call-out fee?",
        answer: "The price is explained before any work starts, so you know where you stand before we begin.",
      },
    ],
  },
};

export function getServiceContent(slug: string): ServiceContent | null {
  return CONTENT[slug] ?? null;
}
