import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 23, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MagicFishbowl ("Service"), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              MagicFishbowl is a local lead-capture and loyalty platform connecting consumers with local businesses.
              We provide digital loyalty cards, offer redemption, and customer relationship tools to merchants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Merchant Accounts</h2>
            <p>
              Merchants are responsible for all activity under their accounts. You must provide accurate information
              and keep your credentials secure. Subscription fees are billed according to your chosen plan.
              Free trials are available for new accounts. We reserve the right to suspend accounts that violate
              these terms or engage in fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Consumer Accounts</h2>
            <p>
              Consumers may create accounts using their phone number. You are responsible for maintaining the
              confidentiality of your account. You must be 13 years of age or older to use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Offer Redemption</h2>
            <p>
              Offers are created and managed by individual merchants. MagicFishbowl is not responsible for the
              availability, accuracy, or fulfillment of any merchant offer. Disputes regarding offers should be
              resolved directly with the merchant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit spam or unsolicited messages</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Create fraudulent offers or redemptions</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Payments and Refunds</h2>
            <p>
              Subscription fees are charged in advance. Refunds are not provided for partial billing periods.
              You may cancel your subscription at any time; your access continues through the end of the paid period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>
              MagicFishbowl is provided "as is" without warranties of any kind. We are not liable for any
              indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after changes constitutes
              acceptance of the new terms. We will notify merchants of material changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@magicfishbowl.com" className="text-brand-600 hover:underline">
                legal@magicfishbowl.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
