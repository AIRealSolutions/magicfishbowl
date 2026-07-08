'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, QrCode, ShieldCheck, Wifi, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Html5Qrcode } from 'html5-qrcode'

type Step = 'idle' | 'scanning' | 'confirm_offer' | 'enter_pin' | 'processing' | 'success' | 'error'

interface ScanResult {
  member: { full_name: string; email: string; phone: string }
  offer: { id: string; title: string }
  redemption_id: string
}

interface Props {
  merchantId: string
  merchantName: string
  staff: Array<{ id: string; full_name: string }>
  offers: Array<{ id: string; title: string; offer_type: string; discount_value: number | null; cooldown_days: number }>
}

export default function ScannerClient({ merchantId, merchantName, staff, offers }: Props) {
  const [step, setStep] = useState<Step>('idle')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedOffer, setSelectedOffer] = useState(offers[0]?.id ?? '')
  const [selectedStaff, setSelectedStaff] = useState(staff[0]?.id ?? '')
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [scanMethod, setScanMethod] = useState<'qr' | 'nfc'>('qr')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const pinInputRef = useRef<HTMLInputElement>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
  }, [])

  useEffect(() => {
    return () => { stopScanner() }
  }, [stopScanner])

  async function startQrScan() {
    setStep('scanning')
    setScanMethod('qr')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner()
          handleTokenScanned(decodedText, 'qr')
        },
        undefined
      )
    } catch {
      toast.error('Camera access denied. Please allow camera permissions.')
      setStep('idle')
    }
  }

  async function startNfcScan() {
    if (!('NDEFReader' in window)) {
      toast.error('NFC is not supported on this device. Use QR code instead.')
      return
    }
    setStep('scanning')
    setScanMethod('nfc')
    try {
      // @ts-expect-error Web NFC API
      const reader = new NDEFReader()
      await reader.scan()
      reader.addEventListener('reading', ({ message }: { message: { records: Array<{ data: ArrayBuffer }> } }) => {
        const record = message.records[0]
        if (record) {
          const decoder = new TextDecoder()
          const token = decoder.decode(record.data)
          handleTokenScanned(token, 'nfc')
        }
      })
    } catch {
      toast.error('NFC scan failed.')
      setStep('idle')
    }
  }

  async function handleTokenScanned(token: string, method: 'qr' | 'nfc') {
    setStep('processing')
    try {
      const res = await fetch('/api/scan/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, merchant_id: merchantId, offer_id: selectedOffer, method }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      setScanResult(data)
      setStep('confirm_offer')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Scan failed')
      setStep('error')
    }
  }

  async function handleConfirmOffer() {
    setStep('enter_pin')
    setTimeout(() => pinInputRef.current?.focus(), 100)
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!scanResult) return
    setStep('processing')
    try {
      const res = await fetch('/api/scan/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemption_id: scanResult.redemption_id,
          staff_id: selectedStaff,
          pin,
          merchant_id: merchantId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'PIN verification failed')
      setStep('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'PIN incorrect')
      setStep('error')
    }
  }

  function reset() {
    setStep('idle')
    setScanResult(null)
    setPin('')
    setErrorMsg('')
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Scanner</h1>
        <p className="text-sm text-gray-500">{merchantName}</p>
      </div>

      {/* Staff & Offer selectors (always visible) */}
      {(step === 'idle' || step === 'scanning') && (
        <div className="card mb-4 space-y-4">
          <div>
            <label className="label">Active Offer</label>
            {offers.length === 0 ? (
              <div className="text-sm text-red-500 p-3 bg-red-50 rounded-xl">No active offers. Create one first.</div>
            ) : (
              <select className="input" value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)}>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} {o.offer_type === 'discount' ? `(${o.discount_value}% off)` : '(Free)'}
                  </option>
                ))}
              </select>
            )}
          </div>
          {staff.length > 0 && (
            <div>
              <label className="label">Staff Member</label>
              <select className="input" value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Idle state */}
      {step === 'idle' && (
        <div className="space-y-3">
          <button
            onClick={startQrScan}
            disabled={!selectedOffer || offers.length === 0}
            className="btn-primary w-full justify-center text-base py-4"
          >
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </button>
          <button
            onClick={startNfcScan}
            disabled={!selectedOffer || offers.length === 0}
            className="btn-secondary w-full justify-center text-base py-4"
          >
            <Wifi className="h-5 w-5" />
            Tap NFC Card
          </button>
        </div>
      )}

      {/* Scanning */}
      {step === 'scanning' && (
        <div>
          {scanMethod === 'qr' ? (
            <div>
              <div id="qr-reader" className="rounded-2xl overflow-hidden" />
              <button onClick={() => { stopScanner(); setStep('idle') }} className="btn-secondary w-full justify-center mt-4">
                Cancel
              </button>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Wifi className="h-16 w-16 text-brand-400 mx-auto mb-4 animate-pulse" />
              <p className="font-semibold text-gray-900">Waiting for NFC tap...</p>
              <p className="text-sm text-gray-400 mt-1">Ask member to tap their card to this device</p>
              <button onClick={() => setStep('idle')} className="btn-secondary mt-6 mx-auto">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="card text-center py-12">
          <Loader2 className="h-12 w-12 text-brand-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Processing...</p>
        </div>
      )}

      {/* Confirm offer */}
      {step === 'confirm_offer' && scanResult && (
        <div className="card space-y-4">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl mx-auto mb-3">
              {scanResult.member.full_name[0].toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{scanResult.member.full_name}</h2>
            <p className="text-sm text-gray-400">{scanResult.member.email}</p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">Offer</div>
            <div className="font-semibold text-gray-900">{scanResult.offer.title}</div>
          </div>
          <div className="text-xs text-gray-400 text-center">
            ✓ Membership valid · ✓ Offer eligible · ✓ Cooldown clear
          </div>
          <button onClick={handleConfirmOffer} className="btn-primary w-full justify-center text-base py-4">
            <ShieldCheck className="h-5 w-5" />
            Continue to PIN Confirmation
          </button>
          <button onClick={reset} className="btn-secondary w-full justify-center">Cancel</button>
        </div>
      )}

      {/* Enter PIN */}
      {step === 'enter_pin' && (
        <form onSubmit={handlePinSubmit} className="card space-y-4">
          <div className="text-center">
            <ShieldCheck className="h-12 w-12 text-brand-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">Enter Staff PIN</h2>
            <p className="text-sm text-gray-400">Confirm redemption with your assigned PIN</p>
          </div>
          <div>
            <input
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              minLength={4}
              maxLength={6}
              required
              className="input text-center text-3xl tracking-[0.5em] font-bold py-5"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
          <button type="submit" disabled={pin.length < 4} className="btn-primary w-full justify-center text-base py-4">
            <CheckCircle2 className="h-5 w-5" />
            Confirm Redemption
          </button>
          <button type="button" onClick={reset} className="btn-secondary w-full justify-center">Cancel</button>
        </form>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="card text-center py-10 space-y-4">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Redeemed!</h2>
            <p className="text-sm text-gray-500 mt-1">Lead captured · CRM updated · Drip sequence started</p>
          </div>
          {scanResult && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-800">
              <strong>{scanResult.member.full_name}</strong> — {scanResult.offer.title}
            </div>
          )}
          <button onClick={reset} className="btn-primary w-full justify-center mt-4">
            Scan Next Customer
          </button>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="card text-center py-10 space-y-4">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-600">Redemption Failed</h2>
            <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
          </div>
          <button onClick={reset} className="btn-primary w-full justify-center">Try Again</button>
        </div>
      )}
    </div>
  )
}
