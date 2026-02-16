import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us - The Civic Posts',
  description: 'Learn about The Civic Posts - Your trusted source for news, entertainment, sports, health & lifestyle, and editorial content.',
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-merriweather">
            About Us
          </h1>
          <p className="text-gray-600 mb-8 text-lg font-merriweather">
            Your trusted source for quality journalism and engaging content.
          </p>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 font-merriweather">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Who We Are</h2>
              <p>
                The Civic Posts is a leading digital media platform dedicated to delivering timely, accurate, and engaging content across multiple categories. We strive to keep our readers informed, entertained, and connected with the world around them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Mission</h2>
              <p>
                Our mission is to provide high-quality journalism and content that informs, educates, and entertains our diverse audience. We are committed to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivering accurate and unbiased news coverage</li>
                <li>Providing engaging entertainment content</li>
                <li>Keeping readers updated on sports events and trends</li>
                <li>Promoting health and wellness through informative articles</li>
                <li>Offering thoughtful editorial perspectives on important issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">What We Cover</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">News</h3>
                  <p className="text-gray-700">
                    Stay informed with the latest breaking news, current events, and in-depth analysis from around the world.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Entertainment</h3>
                  <p className="text-gray-700">
                    Discover the latest in movies, music, television, celebrity news, and pop culture trends.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sports</h3>
                  <p className="text-gray-700">
                    Get comprehensive coverage of sports events, athlete profiles, and sports analysis.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Health & Life Style</h3>
                  <p className="text-gray-700">
                    Access expert advice on health, wellness, fitness tips, and lifestyle improvements.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg md:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Editorial</h3>
                  <p className="text-gray-700">
                    Read thought-provoking editorials and opinion pieces on important social, political, and cultural topics.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Values</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Integrity</h3>
                    <p className="text-gray-700">We maintain the highest standards of journalistic integrity and ethical reporting.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Excellence</h3>
                    <p className="text-gray-700">We strive for excellence in every article, ensuring quality content that resonates with our readers.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Community</h3>
                    <p className="text-gray-700">We value our readers and strive to build a strong, engaged community around quality content.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Contact Us</h2>
              <p>
                We&apos;d love to hear from you! Whether you have a story tip, feedback, or just want to say hello, feel free to reach out.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Email:</p>
                <a href="mailto:shraddhamedia.corp@gmail.com" className="text-orange-600 hover:text-orange-700 text-lg">
                  shraddhamedia.corp@gmail.com
                </a>
                <p className="mt-4 text-gray-600">
                  For general inquiries, feedback, or to report an issue, please use our <Link href="/contact-us" className="text-orange-600 hover:text-orange-700 underline">contact form</Link>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Thank You</h2>
              <p>
                Thank you for being part of The Civic Posts community. Your readership and engagement inspire us to continue delivering quality content every day.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
