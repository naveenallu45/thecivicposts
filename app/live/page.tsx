import { Metadata } from 'next'
import connectDB from '@/lib/mongodb'
import Settings from '@/models/Settings'
import { extractYouTubeVideoId } from '@/lib/youtube-utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
    title: 'Live Updates | The Civic Posts',
    description: 'Watch live news, events, and updates from The Civic Posts. Stay informed with our real-time broadcasts.',
    openGraph: {
        title: 'Live Updates | The Civic Posts',
        description: 'Watch live news, events, and updates from The Civic Posts.',
        type: 'website',
    },
}

async function getLiveVideoIds() {
    try {
        await connectDB()
        const [liveLinksSettings, liveSettings] = await Promise.all([
            Settings.findOne({ key: 'youtube_live_links' }),
            Settings.findOne({ key: 'youtube_live_link' }),
        ])
        const links = Array.isArray(liveLinksSettings?.value)
            ? liveLinksSettings.value
            : (liveSettings?.value ? [liveSettings.value] : [])
        return links
            .map((link: unknown) => extractYouTubeVideoId(String(link || '')))
            .filter(Boolean)
    } catch (error) {
        console.error('Error fetching live settings:', error)
    }
    return []
}

export default async function LivePage() {
    const videoIds = await getLiveVideoIds()

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">Live Updates</h1>
                </div>
                <p className="text-gray-600 max-w-2xl">
                    Stay tuned for real-time coverage of the latest news, sports events, and more directly from The Civic Posts.
                </p>
            </div>

            {videoIds.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 lg:max-w-5xl lg:mx-auto">
                    {videoIds.map((videoId: string, idx: number) => (
                        <div key={`${videoId}-${idx}`} className="aspect-video w-full bg-black border-b border-gray-200 last:border-b-0">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                                title={`Live Stream ${idx + 1}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-inner border-2 border-dashed border-gray-300 py-24 px-6 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Live Stream Currently</h2>
                        <p className="text-gray-500 mb-8">
                            We&apos;re not broadcasting at the moment. Please check back later or explore our latest articles below.
                        </p>
                        <Link
                            href="/news"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                        >
                            Go to Latest News
                        </Link>
                    </div>
                </div>
            )}

            <section className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif border-b-2 border-orange-500 pb-2 inline-block">
                    Trending Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['News', 'Entertainment', 'Sports', 'Technology', 'Health', 'Automobiles'].map((cat) => (
                        <Link
                            key={cat}
                            href={`/${cat.toLowerCase().replace(' ', '-')}`}
                            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100 group"
                        >
                            <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{cat}</div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>

    )
}
