'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Share2, Clock, QrCode, Wifi } from 'lucide-react'
import QRCode from 'qrcode'
import { formatPhone, getCategoryEmoji } from '@/lib/utils'
import type { Member } from '@/lib/supabase/types'

interface Redemption {
  id: string
  confirmed_at: string | null
  scan_method: string
  offers: { title: string } | null
  merchants: { business_name: string; category: string } | null
}

interface Props {
  member: Member
  redemptions: Redemption[]
}

export default function VirtualCard({ member, redemptions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<'card' | 'history'>('card')

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, member.qr_token, {
      width: 240,
      margin: 2,
      color: { dark: '#0369a1', light: '#f0f9ff' },
      errorCorrectionLevel: 'H',
    })
  }, [member.qr_token])

  async function handleShare() {
    try {
      await navigator.share({
        title: 'My MagicFishbowl Card',
        text: 'Check out deals near you!',
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      alert('Card link copied!')
    }
  }

  async function handleNfc() {
    if (!('NDEFWriter' in window)) {
      alert('NFC writing is not supported on this device. Use QR code instead.')
      return
    }
    try {
      // @ts-expect-error Web NFC API
      const writer = new NDEFWriter()
      await writer.write({ records: [{ recordType: 'text', data: member.nfc_token }] })
      alert('NFC card written successfully!')
    } catch (err) {
      alert('Failed to write NFC tag: ' + String(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-800 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Link href="/" className="text-white/70 hover:text-white text-sm">← Home</Link>
        <span className="text-white font-bold text-sm">🐟 MagicFishbowl</span>
        <button onClick={handleShare} className="text-white/70 hover:text-white">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Card */}
      <div className="px-4 pb-6">
        <div className="rounded-3xl bg-gradient-to-br from-white to-brand-50 p-6 shadow-2xl shadow-brand-900/40 mx-auto max-w-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-0.5">MagicFishbowl</div>
              <div className="text-lg font-bold text-gray-900">{member.full_name}</div>
              <div className="text-xs text-gray-400">{member.email}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl shadow-md">
              🐟
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-4">
            <div className="rounded-2xl bg-brand-50 p-3 border-2 border-brand-100">
              <canvas ref={canvasRef} className="rounded-lg" />
            </div>
          </div>

          {/* Token hint */}
          <div className="text-center text-xs text-gray-400 font-mono mb-4">
            {member.qr_token.slice(0, 8)}...{member.qr_token.slice(-4)}
          </div>

          {/* Card Footer */}
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl bg-brand-50 p-3 text-center">
              <div className="text-xs text-gray-400">Phone</div>
              <div className="text-xs font-semibold text-gray-700 mt-0.5">{formatPhone(member.phone)}</div>
            </div>
            <div className="flex-1 rounded-xl bg-green-50 p-3 text-center">
              <div className="text-xs text-gray-400">Status</div>
              <div className="text-xs font-semibold text-green-600 mt-0.5">✓ Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 flex gap-3 max-w-sm mx-auto">
        <Link
          href="/discover"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/20 backdrop-blur px-4 py-3 text-sm font-semibold text-white hover:bg-white/30 transition"
        >
          <MapPin className="h-4 w-4" />
          Find Deals
        </Link>
        <button
          onClick={handleNfc}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/20 backdrop-blur px-4 py-3 text-sm font-semibold text-white hover:bg-white/30 transition"
        >
          <Wifi className="h-4 w-4" />
          Write NFC
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 px-4 max-w-sm mx-auto">
        <div className="flex gap-1 rounded-xl bg-brand-700/50 p-1">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${activeTab === 'card' ? 'bg-white text-brand-700' : 'text-white/70 hover:text-white'}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <QrCode className="h-4 w-4" /> My Card
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${activeTab === 'history' ? 'bg-white text-brand-700' : 'text-white/70 hover:text-white'}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4" /> History
            </span>
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="mt-4 space-y-3">
            {redemptions.length === 0 ? (
              <div className="text-center py-8 text-white/60 text-sm">
                No redemptions yet. Find a deal and scan your card!
              </div>
            ) : (
              redemptions.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-start gap-3">
                  <div className="text-2xl">{getCategoryEmoji(r.merchants?.category ?? 'other')}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{r.merchants?.business_name}</div>
                    <div className="text-xs text-white/70 truncate">{r.offers?.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {r.confirmed_at ? new Date(r.confirmed_at).toLocaleDateString() : '—'}
                      {' · '}{r.scan_method.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'card' && (
          <div className="mt-4 rounded-xl bg-white/10 backdrop-blur p-4">
            <p className="text-xs text-white/70 text-center leading-relaxed">
              Show this QR code at any participating business to claim your offer.
              Your card works at every MagicFishbowl merchant — no separate apps or logins.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
