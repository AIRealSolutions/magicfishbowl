'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Phone, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { normalizePhone } from '@/lib/utils'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send code')
      toast.success('Verification code sent!')
      setStep('otp')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invalid code')

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.temp_password,
      })
      if (error) throw error

      toast.success('Welcome back!')
      router.push('/card')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="px-4 pt-6 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-10 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-600 text-3xl mb-3">🐟</div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in with your phone number</p>
          </div>

          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  className="input"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
              <p className="text-center text-xs text-gray-400">
                New to MagicFishbowl?{' '}
                <Link href="/join" className="text-brand-600 font-medium hover:underline">Get a free card</Link>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-brand-50">
                <Phone className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Code sent to</p>
                <p className="text-sm text-brand-600 font-bold">{phone}</p>
              </div>
              <div>
                <label className="label">6-Digit Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  className="input text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
              <button type="button" className="w-full text-center text-sm text-gray-500 hover:text-brand-600"
                onClick={() => setStep('phone')}>
                ← Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
