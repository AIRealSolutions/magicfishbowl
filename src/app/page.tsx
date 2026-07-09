import Link from 'next/link'
import { BarChart3, Users, Zap, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'

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
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <Link href="/biz?login=1" className="hover:text-brand-600 transition-colors">Sign In</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/biz" className="btn-primary text-sm">
              Get Started
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
            Simple offer management for local businesses
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Grow Your Business With
            <span className="block text-yellow-300">Better Customer Data</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-brand-100">
            Create simple offers, track customer buying habits, and grow your email list. No complexity. Just results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/biz" className="btn-primary text-base px-8 py-4 shadow-lg shadow-brand-900/30">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/biz?login=1" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-brand-200">14-day free trial · No credit card required</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Started in Minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to launch your offers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <Users className="h-8 w-8 text-brand-600" />,
                title: 'Sign Up',
                desc: 'Create your business account and set your basic info in under a minute.',
              },
              {
                step: '2',
                icon: <Zap className="h-8 w-8 text-fish-coral" />,
                title: 'Create Offers',
                desc: 'Add simple deals or promotions. Set limits and expiration dates as needed.',
              },
              {
                step: '3',
                icon: <TrendingUp className="h-8 w-8 text-fish-purple" />,
                title: 'Track Customers',
                desc: 'Watch customer engagement, collect contact info, and grow your email list.',
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
              <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">Built for Businesses</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Easy Offer Management.<br />Real Customer Insights.
              </h2>
              <p className="text-gray-500 mb-8">
                Stop guessing about your customers. Create simple offers, track who's engaging, and build your email list automatically.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Simple offer creation and management',
                  'Automatic customer data collection',
                  'Track offers by engagement and redemptions',
                  'Built-in email and SMS integration',
                  'Staff-friendly dashboard',
                  'Export customer lists anytime',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/biz" className="btn-primary">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <BarChart3 className="h-6 w-6 text-brand-600" />, label: 'Simplicity', value: '< 5 min', sub: 'to set up' },
                { icon: <TrendingUp className="h-6 w-6 text-green-600" />, label: 'Engagement', value: 'Real-time', sub: 'analytics' },
                { icon: <Users className="h-6 w-6 text-purple-600" />, label: 'Customer Data', value: 'Owned', sub: 'by you' },
                { icon: <Zap className="h-6 w-6 text-yellow-500" />, label: 'Integration', value: 'Built-in', sub: 'email & SMS' },
              ].map((stat) => (
                <div key={stat.label} className="card">
                  {stat.icon}
                  <div className="mt-3 text-sm font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs font-medium text-gray-700">{stat.label}</div>
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
                features: ['Up to 10 active offers', '2 staff members', '1,000 customers', 'Email campaigns', 'CSV export'],
              },
              {
                name: 'Pro', price: 99, color: 'border-brand-500',
                highlight: true,
                features: ['Unlimited offers', '10 staff members', '10,000 customers', 'Email + SMS campaigns', 'Priority support'],
              },
              {
                name: 'Business', price: 199, color: 'border-gray-200',
                highlight: false,
                features: ['Unlimited offers', 'Unlimited staff', 'Unlimited customers', 'Custom integrations', 'Dedicated support'],
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
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-brand-200 mb-8">Join local businesses building better customer relationships with MagicFishbowl.</p>
          <Link href="/biz" className="inline-flex items-center gap-2 btn-primary bg-white text-brand-700 hover:bg-brand-50">
            Start Your Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
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
            <Link href="/biz" className="hover:text-gray-700">For Businesses</Link>
          </div>
          <div>© {new Date().getFullYear()} MagicFishbowl</div>
        </div>
      </footer>
    </div>
  )
}
