import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getActiveServices } from '@/lib/services'

// 🎯 100% OPTIMIZED SITEMAP FOR GOOGLE ADS + SEO + NEXT.JS
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'
  const currentDate = new Date()
  
  // 🏠 CORE PAGES - Maximum Priority
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  // 🔧 SERVICE LANDING PAGES - one per active service, driven by the services
  // table. These rank for "<service> south west london" style queries.
  let servicePages: MetadataRoute.Sitemap = []

  try {
    const services = await getActiveServices()
    servicePages = services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch {
    servicePages = []
  }

  // 📄 LEGAL & POLICY PAGES - Standard Priority
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/gdpr`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // 🗺️ AREA LANDING PAGES - one indexable page per covered area, driven by
  // admin_areas_cover. These are what rank for "emergency plumber <area>".
  let serviceAreaPages: MetadataRoute.Sitemap = []

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('admin_areas_cover')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('order', { ascending: true })

    serviceAreaPages = (data || []).map((area: { slug: string; updated_at: string }) => ({
      url: `${baseUrl}/areas/${area.slug}`,
      lastModified: area.updated_at ? new Date(area.updated_at) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch {
    serviceAreaPages = []
  }

  // 🔧 SPA SECTIONS - All content is on homepage with anchors
  // No separate service pages needed for SPA

  // 📊 SPA CONTENT - All sections are on homepage with hash navigation
  // No separate content pages needed for SPA

  // 🏆 SPA SITEMAP - Only Real Pages
  return [
    ...corePages,           // Priority 1.0 - Homepage with all SPA content
    ...serviceAreaPages,    // Priority 0.9 - One landing page per covered area
    ...servicePages,        // Priority 0.9 - One landing page per service
    ...legalPages,          // Priority 0.3 - Privacy & Terms pages only
  ]
} 