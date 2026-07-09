'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/utils'

type Mode = 'login' | 'signup'

export default function BizPage() {
  const router = useRouter()
  const params = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)

  // Initialize mode and plan from URL params
  const initialMode = params?.get('login') === '1' ? 'login' : 'signup'
  const initialPlan = params?.get('plan') ?? 'starter'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [signupStep, setSignupStep] = useState<'account' | 'business'>('account')
  const [error, setError] = useState<string>('')

  // Use refs for form values to avoid re-renders clearing them
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const businessNameRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const planRef = useRef<string>(initialPlan)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const email = emailRef.current?.value.trim()
    const password = passwordRef.current?.value

    if (!email || !password) {
      setError('Email and password required')
      return
    }

    setLoading(true)
    setError('Checking credentials...')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        router.push('/biz/dashboard')
      } else {
        setError('Login failed')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login error')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (signupStep === 'account') {
      const email = emailRef.current?.value.trim()
      const password = passwordRef.current?.value

      if (!email || !password) {
        setError('Email and password required')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      setError('')
      setSignupStep('business')
      return
    }

    const email = emailRef.current?.value.trim()
    const password = passwordRef.current?.value
    const businessName = businessNameRef.current?.value.trim()
    const category = categoryRef.current?.value
    const address = addressRef.current?.value.trim()

    if (!businessName || !category) {
      setError('Business name and category required')
      return
    }

    setLoading(true)
    setError('Creating account...')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email!,
        password: password!,
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user?.id) throw new Error('Signup failed')

      setError('Setting up business...')

      const res = await fetch('/api/merchants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authData.user.id,
          business_name: businessName,
          category,
          address: address || null,
          subscription_tier: planRef.current,
          subscription_status: 'trialing',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Setup failed')

      setError('')
      router.push('/biz/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
                : signupStep === 'account'
                ? 'Step 1: Create your account'
                : 'Step 2: Business details'}
            </p>
            {loading && (
              <div className="mt-2 text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded inline-block">
                {error || 'Processing...'}
              </div>
            )}
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
              onClick={() => { setMode('signup'); setError(''); setSignupStep('account'); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setError(''); setSignupStep('account'); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Sign In
            </button>
          </div>

          {/* Always show form if not in error state */}
          {!pageError && (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* Signup step 1: Account */}
            {(mode === 'login' || signupStep === 'account') && (
              <>
                <div>
                  <label className="label">Email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    className="input"
                    placeholder="you@business.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      className="input pr-10"
                      placeholder="Min. 8 characters"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
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
                  <input
                    ref={businessNameRef}
                    type="text"
                    required
                    className="input"
                    placeholder="The Local Bakery"
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select ref={categoryRef} required className="input">
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Business Address</label>
                  <input
                    ref={addressRef}
                    type="text"
                    className="input"
                    placeholder="123 Main St, City, State"
                  />
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
                        onClick={() => { planRef.current = p.value }}
                        className={`rounded-xl border-2 p-3 text-center transition ${
                          planRef.current === p.value
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
          )}
        </div>
      </div>
    </div>
  )
}

