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
  const [error, setError] = useState<string>('')

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
    setError('')
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
    setError('')
    if (signupStep === 'account') {
      // Validate email and password before proceeding
      if (!form.email || !form.password) {
        toast.error('Email and password are required')
        return
      }
      if (form.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }
      setSignupStep('business')
      return
    }

    // Validate business details
    if (!form.business_name || !form.category) {
      toast.error('Business name and category are required')
      return
    }

    setLoading(true)
    try {
      console.log('Starting signup for:', form.email)

      // Step 1: Create auth user
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        })
        console.log('Auth response:', { authError, userId: authData?.user?.id })

        if (authError) throw new Error(`Auth failed: ${authError.message}`)
        if (!authData.user) throw new Error('Auth succeeded but no user returned')

        // Step 2: Create merchant record via API
        try {
          console.log('Creating merchant for user:', authData.user.id)
          const merchantResponse = await fetch('/api/merchants/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: authData.user.id,
              business_name: form.business_name,
              category: form.category,
              address: form.address || null,
              subscription_tier: form.plan,
              subscription_status: 'trialing',
            }),
          })

          console.log('Merchant response status:', merchantResponse.status)

          if (!merchantResponse.ok) {
            const errorData = await merchantResponse.json()
            throw new Error(`API Error (${merchantResponse.status}): ${errorData.error || 'Unknown error'}`)
          }

          const merchantData = await merchantResponse.json()
          console.log('Merchant created:', merchantData)

          toast.success('Welcome to MagicFishbowl! Redirecting to your dashboard...')
          console.log('Signup successful, redirecting to dashboard')

          // Use a longer timeout to ensure auth is synced
          setTimeout(() => {
            console.log('Executing redirect to /biz/dashboard')
            router.push('/biz/dashboard')
          }, 1500)
        } catch (merchantErr: unknown) {
          throw new Error(`Merchant creation failed: ${merchantErr instanceof Error ? merchantErr.message : 'Unknown error'}`)
        }
      } catch (authErr: unknown) {
        throw authErr
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed - unknown error'
      console.error('Signup error:', err)
      setError(message)
      toast.error(message)
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

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setError(''); }}
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

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && signupStep === 'business' && (!form.business_name || !form.category))}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
