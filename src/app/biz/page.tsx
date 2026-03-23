'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/utils'

type Mode = 'login' | 'signup'

function BizPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('login') === '1' ? 'login' : 'signup')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [signupStep, setSignupStep] = useState<'account' | 'business'>('account')

  const [form, setForm] = useState({
    email: '',
    password: '',
    business_name: '',
    category: '',
    address: '',
    plan: params.get('plan') ?? 'starter',
  })

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      router.push('/biz/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (signupStep === 'account') {
      setSignupStep('business')
      return
    }

    setLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed')

      // Create merchant record
      const { error: merchantError } = await supabase.from('merchants').insert({
        owner_user_id: authData.user.id,
        business_name: form.business_name,
        category: form.category,
        address: form.address,
        subscription_tier: form.plan,
        subscription_status: 'trialing',
      })
      if (merchantError) throw merchantError

      toast.success('Welcome to MagicFishbowl! Redirecting to your dashboard...')
      setTimeout(() => router.push('/biz/dashboard'), 1200)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="px-6 pt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Home</Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-10 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🐟</div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Sign In' : 'List Your Business'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login'
                ? 'Access your MagicFishbowl dashboard'
                : '14-day free trial · No credit card required'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* Signup step 1: Account */}
            {(mode === 'login' || signupStep === 'account') && (
              <>
                <div>
                  <label className="label">Email</label>
                  <input type="email" required className="input" placeholder="you@business.com"
                    value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required minLength={8} className="input pr-10"
                      placeholder="Min. 8 characters"
                      value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Signup step 2: Business */}
            {mode === 'signup' && signupStep === 'business' && (
              <>
                <div>
                  <label className="label">Business Name</label>
                  <input type="text" required className="input" placeholder="The Local Bakery"
                    value={form.business_name} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select required className="input" value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Business Address</label>
                  <input type="text" className="input" placeholder="123 Main St, City, State"
                    value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'starter', price: '$49', label: 'Starter' },
                      { value: 'pro', price: '$99', label: 'Pro' },
                      { value: 'agency', price: '$199', label: 'Agency' },
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, plan: p.value }))}
                        className={`rounded-xl border-2 p-3 text-center transition ${
                          form.plan === p.value
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.price}/mo</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : signupStep === 'account'
                ? 'Continue'
                : 'Start Free Trial'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            {mode === 'signup' && signupStep === 'business' && (
              <button type="button" className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
                onClick={() => setSignupStep('account')}>
                ← Back
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function BizPage() {
  return (
    <Suspense>
      <BizPageInner />
    </Suspense>
  )
}
