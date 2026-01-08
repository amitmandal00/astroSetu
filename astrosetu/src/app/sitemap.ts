import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.mindveda.net'
  const currentDate = new Date()

  // Core pages with high priority
  const corePages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ai-astrology`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-astrology/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Astrology services pages
  const astrologyServices = [
    '/kundli',
    '/horoscope',
    '/match',
    '/panchang',
    '/muhurat',
    '/numerology',
    '/synastry',
    '/astrologers',
    '/services',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Report pages
  const reportPages = [
    '/reports/general',
    '/reports/dasha-phal',
    '/reports/lalkitab',
    '/reports/sadesati',
    '/reports/varshphal',
    '/reports/mangal-dosha',
    '/reports/ascendant',
    '/reports/life',
    '/reports/love',
    '/reports/yearly',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Legal and information pages
  const legalPages = [
    '/privacy',
    '/terms',
    '/disclaimer',
    '/refund',
    '/contact',
    '/cookies',
    '/about',
    '/faq',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Additional utility pages
  const utilityPages = [
    '/choghadiya',
    '/auspicious-period',
    '/batch-match',
    '/transit',
    '/remedies',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    ...corePages,
    ...astrologyServices,
    ...reportPages,
    ...legalPages,
    ...utilityPages,
  ]
}

