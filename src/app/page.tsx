import Link from 'next/link'
import { MapPin, QrCode, Zap, Users, TrendingUp, Shield, Star, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <span className="text-2xl">🐟</span>
            <span>MagicFishbowl</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/discover" className="hover:text-brand-600 transition-colors">Find Deals</Link>
            <Link href="/biz" className="hover:text-brand-600 transition-colors">For Businesses</Link>
            <Link href="/biz?login=1" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/join" className="btn-primary text-sm">
              Get Free Card
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-fish-indigo pb-24 pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-fish-purple blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Zap className="h-4 w-4 text-yellow-300" />
            The fishbowl card drop — reinvented for the digital age
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Turn Foot Traffic Into
            <span className="block text-yellow-300">Loyal Customers</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-brand-100">
            Businesses offer free items or discounts. Customers scan in and get rewarded.
            You capture the lead, trigger automated follow-up, and grow your list — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/join" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-900/30">
              Get My Free Card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/biz" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              List Your Business
            </Link>
          </div>
          <p className="mt-4 text-sm text-brand-200">No app to download · Free for consumers · 14-day trial for businesses</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Three simple steps — no app required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <QrCode className="h-8 w-8 text-brand-600" />,
                title: 'Get Your Free Card',
                desc: 'Register on mobile web in under 60 seconds. Get a universal QR card saved to your phone.',
              },
              {
                step: '2',
                icon: <MapPin className="h-8 w-8 text-fish-coral" />,
                title: 'Find Local Deals',
                desc: 'Browse the map for participating businesses offering free items or discounts near you.',
              },
              {
                step: '3',
                icon: <Zap className="h-8 w-8 text-fish-purple" />,
                title: 'Scan & Claim',
                desc: 'Show your QR at the register. Staff scans and confirms — you get your reward instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="card text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  {item.icon}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">For Local Businesses</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Your Digital Fishbowl.<br />Automated.
              </h2>
              <p className="text-gray-500 mb-8">
                Remember putting a bowl on the counter for business cards? MagicFishbowl does
                that digitally — with instant lead capture, verified phone numbers, and
                automated follow-up built in.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Capture verified name, email & phone at every visit',
                  'Two-step QR + PIN redemption prevents fraud',
                  'Auto-trigger email & SMS drip sequences',
                  'Staff scanner tool — no login required for cashiers',
                  'Consumer discovery map drives new foot traffic',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/biz" className="btn-primary">
                Start Free 14-Day Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Users className="h-6 w-6 text-brand-600" />, label: 'Leads Captured', value: '2,400+', sub: 'avg per merchant/yr' },
                { icon: <TrendingUp className="h-6 w-6 text-green-600" />, label: 'Return Visit Rate', value: '68%', sub: 'with drip follow-up' },
                { icon: <Shield className="h-6 w-6 text-purple-600" />, label: 'Fraud Prevention', value: '4-Layer', sub: 'SMS + PIN + cooldown' },
                { icon: <Star className="h-6 w-6 text-yellow-500" />, label: 'Setup Time', value: '< 5 min', sub: 'self-service onboarding' },
              ].map((stat) => (
                <div key={stat.label} className="card">
                  {stat.icon}
                  <div className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">14-day free trial on all plans. No charge until day 15.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: 49, color: 'border-gray-200',
                highlight: false,
                features: ['1 active offer', '2 staff seats', '500 CRM contacts', 'Email campaigns', 'CSV export', 'Discovery map listing'],
              },
              {
                name: 'Pro', price: 99, color: 'border-brand-500',
                highlight: true,
                features: ['5 active offers', '10 staff seats', '5,000 CRM contacts', 'Email + SMS campaigns', 'Social scheduler', 'Featured map placement add-on'],
              },
              {
                name: 'Agency', price: 199, color: 'border-gray-200',
                highlight: false,
                features: ['Unlimited offers', 'Unlimited staff seats', 'Unlimited contacts', '2-way SMS inbox', 'White-label subdomain', 'API access', 'Priority support'],
              },
            ].map((tier) => (
              <div key={tier.name} className={`card border-2 ${tier.color} relative ${tier.highlight ? 'shadow-xl shadow-brand-100' : ''}`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-0.5 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-lg font-bold text-gray-900">{tier.name}</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">${tier.price}</span>
                    <span className="text-sm text-gray-400">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/biz?plan=${tier.name.toLowerCase()}`}
                  className={tier.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-700 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to fill your digital fishbowl?</h2>
          <p className="text-brand-200 mb-8">Join hundreds of local businesses already growing their lists with MagicFishbowl.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/biz" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
              List Your Business — Free Trial
            </Link>
            <Link href="/join" className="btn-outline border-white/40 text-white hover:bg-white/10">
              Get My Free Consumer Card
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <span className="text-xl">🐟</span> MagicFishbowl
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            <Link href="/discover" className="hover:text-gray-700">Find Deals</Link>
            <Link href="/biz" className="hover:text-gray-700">For Business</Link>
          </div>
          <div>© {new Date().getFullYear()} MagicFishbowl</div>
        </div>
      </footer>
    </div>
  )
}
