import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions - The Civic Posts',
  description: 'Terms and Conditions for The Civic Posts. Please read these terms carefully before using our website.',
}

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-merriweather">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 font-merriweather">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Introduction</h2>
              <p>
                Welcome to The Civic Posts (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website. By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of these Terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Acceptance of Terms</h2>
              <p>
                By accessing and using The Civic Posts website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on The Civic Posts website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Content</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Our Content</h3>
              <p>
                All content on this website, including articles, images, graphics, logos, and other materials, is the property of The Civic Posts or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 User-Generated Content</h3>
              <p>
                If you post comments or other content on our website, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, and distribute such content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Prohibited Uses</h2>
              <p>You may not use our website:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In any way that violates any applicable national or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Disclaimer</h2>
              <p>
                The materials on The Civic Posts website are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Limitations</h2>
              <p>
                In no event shall The Civic Posts or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Civic Posts website, even if The Civic Posts or a The Civic Posts authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Accuracy of Materials</h2>
              <p>
                The materials appearing on The Civic Posts website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Links</h2>
              <p>
                We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by The Civic Posts of the site. Use of any such linked website is at the user&apos;s own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Modifications</h2>
              <p>
                We may revise these Terms at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
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
