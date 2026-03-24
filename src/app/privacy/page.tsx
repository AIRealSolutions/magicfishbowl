import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 23, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              MagicFishbowl collects information you provide directly, including your name, phone number, and email address
              when you create an account or redeem an offer. We also collect information about your interactions with our
              platform, including offers redeemed and businesses visited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide and improve our services</li>
              <li>Send you verification codes and account notifications</li>
              <li>Connect you with local businesses you choose to engage with</li>
              <li>Send promotional emails from businesses you've opted into</li>
              <li>Analyze usage to improve the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
            <p>
              When you redeem an offer at a business, we share your name, email, and phone number with that merchant.
              We do not sell your personal information to third parties. We may share data with service providers
              who assist us in operating the platform (e.g., SMS delivery, payment processing).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. SMS and Email Communications</h2>
            <p>
              By providing your phone number, you consent to receive SMS verification codes. Promotional SMS messages
              require separate opt-in. You can opt out of promotional emails at any time by replying STOP to any
              message or contacting the business directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. You may request deletion
              of your data by contacting us at privacy@magicfishbowl.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections, hashed credentials,
              and row-level security on our databases. No method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p>
              For privacy-related questions, email us at{' '}
              <a href="mailto:privacy@magicfishbowl.com" className="text-brand-600 hover:underline">
                privacy@magicfishbowl.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
