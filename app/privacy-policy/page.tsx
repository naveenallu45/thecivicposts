import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - The Civic Posts',
  description: 'Privacy Policy for The Civic Posts. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-merriweather">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 font-merriweather">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Introduction</h2>
              <p>
                Welcome to The Civic Posts (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
              <p>
                We may collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscribe to our newsletter</li>
                <li>Contact us through our contact form</li>
                <li>Participate in surveys or promotions</li>
                <li>Comment on articles</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p>
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages you visit and time spent on pages</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our website</li>
                <li>Send you newsletters and updates (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze website usage and trends</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Third-Party Services</h2>
              <p>
                We may use third-party services that collect, monitor, and analyze information to help us improve our website. These third parties may use cookies or other tracking technologies. We do not control these third parties&apos; tracking technologies or how they may be used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Your Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to access your personal information</li>
                <li>Right to rectify inaccurate information</li>
                <li>Right to request deletion of your information</li>
                <li>Right to object to processing of your information</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Children&apos;s Privacy</h2>
              <p>
                Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900">Email:</p>
                <a href="mailto:shraddhamedia.corp@gmail.com" className="text-orange-600 hover:text-orange-700">
                  shraddhamedia.corp@gmail.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
