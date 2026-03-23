'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Phone, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { normalizePhone } from '@/lib/utils'

type Step = 'info' | 'otp' | 'done'

export default function JoinPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    opted_in_sms: true,
    opted_in_email: true,
  })
  const [otp, setOtp] = useState('')

  async function handleSubmitInfo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(form.phone), email: form.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send OTP')
      toast.success('Verification code sent!')
      setStep('otp')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(form.phone),
          otp,
          full_name: form.full_name,
          email: form.email,
          opted_in_sms: form.opted_in_sms,
          opted_in_email: form.opted_in_email,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invalid code')

      // Sign in the created user
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: data.temp_password,
      })
      if (error) throw error

      setStep('done')
      setTimeout(() => router.push('/card'), 1500)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-600 text-3xl mb-3">
              🐟
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Get Your Free Card</h1>
            <p className="text-sm text-gray-500 mt-1">One card works at all participating businesses</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['info', 'otp'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === 'done' || (step === 'otp' && s === 'info')
                    ? 'bg-green-500 text-white'
                    : step === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step === 'done' || (step === 'otp' && s === 'info') ? '✓' : i + 1}
                </div>
                {i < 1 && <div className={`h-0.5 w-8 transition-colors ${step !== 'info' ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step: Info */}
          {step === 'info' && (
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                    <span className="text-xs text-gray-400 font-normal">(required)</span>
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  className="input"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={form.opted_in_email}
                    onChange={(e) => setForm((f) => ({ ...f, opted_in_email: e.target.checked }))}
                  />
                  <span className="text-xs text-gray-600">
                    I agree to receive email marketing from participating businesses
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={form.opted_in_sms}
                    onChange={(e) => setForm((f) => ({ ...f, opted_in_sms: e.target.checked }))}
                  />
                  <span className="text-xs text-gray-600">
                    I agree to receive SMS text messages from participating businesses.
                    {' '}<strong>Msg &amp; data rates may apply.</strong> Reply STOP to unsubscribe.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Sending code...' : 'Send Verification Code'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <p className="text-center text-xs text-gray-400">
                Already have a card?{' '}
                <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-brand-50">
                <Phone className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Code sent to</p>
                <p className="text-sm text-brand-600 font-bold">{form.phone}</p>
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
                {loading ? 'Verifying...' : 'Verify & Create My Card'}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm text-gray-500 hover:text-brand-600"
                onClick={() => setStep('info')}
              >
                ← Change phone number
              </button>
            </form>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h2>
              <p className="text-sm text-gray-500">Opening your virtual card...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
