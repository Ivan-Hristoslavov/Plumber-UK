import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

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

  // 🗺️ SPA AREAS - All areas are displayed on homepage, no separate pages needed
  const serviceAreaPages: MetadataRoute.Sitemap = []

  // 🔧 SPA SECTIONS - All content is on homepage with anchors
  // No separate service pages needed for SPA

  // 📊 SPA CONTENT - All sections are on homepage with hash navigation
  // No separate content pages needed for SPA

  // 🏆 SPA SITEMAP - Only Real Pages
  return [
    ...corePages,           // Priority 1.0 - Homepage with all SPA content
    ...legalPages,          // Priority 0.3 - Privacy & Terms pages only
  ]
} 