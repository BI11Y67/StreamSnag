import { Helmet } from 'react-helmet-async'
import { SITE_NAME, getSiteUrl, DEFAULT_SEO, FAQ_ITEMS } from '../data/seo'

export default function SeoHead({ title, description, path = '/', faqSchema = true }) {
  const base = getSiteUrl()
  const canonical = `${base}${path === '/' ? '' : path}`
  const ogTitle = title || DEFAULT_SEO.title
  const ogDesc = description || DEFAULT_SEO.description
  const imageUrl = `${base}${DEFAULT_SEO.ogImage}`

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: base || undefined,
    description: DEFAULT_SEO.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
  }

  return (
    <Helmet htmlAttributes={{ lang: 'en' }}>
      <title>{ogTitle}</title>
      <meta name="description" content={ogDesc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDesc} />
      <meta name="twitter:image" content={imageUrl} />
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      )}
      <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
    </Helmet>
  )
}
