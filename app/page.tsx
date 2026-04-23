import { Suspense } from 'react'
import AutoRefreshWrapper from '@/components/AutoRefreshWrapper'
import StructuredData from '@/components/StructuredData'
import HomeVisitTracker from '@/components/HomeVisitTracker'
import HomeTopStoriesServer from '@/components/home/HomeTopStoriesServer'
import HomeBelowFoldServer from '@/components/home/HomeBelowFoldServer'
import { TopStoriesSkeleton, BelowFoldSkeleton } from '@/components/home/HomePageSkeletons'

// ISR: Revalidate home page every 30 seconds
export const revalidate = 30
export const dynamic = 'force-static'

const baseUrl = 'https://www.thecivicposts.com'

const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The Civic Posts',
  url: baseUrl,
  description:
    'Stay informed with the latest news, entertainment, sports, health & lifestyle, and editorial content',
  publisher: {
    '@type': 'Organization',
    name: 'The Civic Posts',
    url: baseUrl,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'The Civic Posts',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: [] as string[],
}

/**
 * Streams above-the-fold (top stories) as soon as its two DB queries finish,
 * instead of blocking on trending + 7 category queries — improves LCP/FCP.
 */
export default function Home() {
  return (
    <AutoRefreshWrapper interval={30}>
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          <Suspense fallback={<TopStoriesSkeleton />}>
            <HomeTopStoriesServer />
          </Suspense>

          <Suspense fallback={<BelowFoldSkeleton />}>
            <HomeBelowFoldServer />
          </Suspense>
        </div>
      </main>
      <HomeVisitTracker />
    </AutoRefreshWrapper>
  )
}
