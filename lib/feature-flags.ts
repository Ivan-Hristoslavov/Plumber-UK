/**
 * Temporary visibility switches.
 *
 * These exist so features can be taken off the site without deleting working
 * code. Flip a flag back to `true` and the feature returns exactly as it was.
 */

/**
 * The call and WhatsApp buttons in the navbar itself (not the mobile menu).
 *
 * Turned off at the client's request. Worth knowing before turning it back on:
 * the navbar is sticky, so this button was the only tap-to-call reachable from
 * any scroll position, and adding it was the largest single conversion change
 * made to the site.
 */
export const SHOW_NAVBAR_ACTIONS = false;

/**
 * The floating call and WhatsApp buttons, bottom-right, that appear once the
 * hero has scrolled past. Turned off at the client's request.
 */
export const SHOW_FLOATING_ACTIONS = false;

/**
 * The "What we do" / "Where we work" block on the homepage. Turned off at the
 * client's request.
 *
 * This block was the homepage's only server-rendered path to the individual
 * area and service pages — the hero's area chips and the footer's link columns
 * are both fetched client-side. With it hidden, those pages are reachable from
 * the homepage markup only via the /services and /areas hub links in the navbar,
 * and the hubs link on to each child. They also remain in sitemap.xml.
 */
export const SHOW_COVERAGE_SECTION = false;
