'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { getCategoryEmoji, CATEGORIES } from '@/lib/utils'

interface Offer {
  id: string
  title: string
  offer_type: string
  discount_value: number | null
}

interface Merchant {
  id: string
  business_name: string
  category: string
  address: string | null
  lat: number
  lng: number
  logo_url: string | null
  offers: Offer[]
}

interface Props {
  merchants: Merchant[]
}

export default function DiscoverClient({ merchants }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [selected, setSelected] = useState<Merchant | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = merchants.filter((m) => {
    if (category && m.category !== category) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        m.business_name.toLowerCase().includes(s) ||
        m.category.toLowerCase().includes(s) ||
        m.address?.toLowerCase().includes(s)
      )
    }
    return true
  })

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-78.5, 35.0],
      zoom: 10,
    })
    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')

    merchants.forEach((m) => {
      if (!m.lat || !m.lng) return

      const el = document.createElement('div')
      el.className = 'cursor-pointer text-2xl select-none hover:scale-110 transition-transform'
      el.textContent = getCategoryEmoji(m.category)
      el.title = m.business_name

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map)

      el.addEventListener('click', () => setSelected(m))
    })

    return () => map.remove()
  }, [merchants])

  // Re-filter markers by flying to bounds when filters change
  useEffect(() => {
    if (!mapRef.current || filtered.length === 0) return
    if (filtered.length === merchants.length) return

    const lngs = filtered.map((m) => m.lng)
    const lats = filtered.map((m) => m.lat)
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, maxZoom: 14 }
    )
  }, [filtered, merchants])

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link href="/" className="text-2xl flex-shrink-0">🐟</Link>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex-shrink-0 p-2 rounded-xl border transition ${category ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500'}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <Link href="/join" className="btn-primary text-xs px-3 py-2 hidden sm:inline-flex flex-shrink-0">
          Get Card
        </Link>
      </div>

      {/* Category filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto z-10">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${!category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? '' : c.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${category === c.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Map + list split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div ref={mapContainerRef} className="flex-1" />

        {/* Sidebar list — desktop */}
        <div className="hidden lg:flex flex-col w-80 border-l border-gray-100 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
            {filtered.length} businesses
          </div>
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m); mapRef.current?.flyTo({ center: [m.lng, m.lat], zoom: 15 }) }}
              className={`flex items-start gap-3 px-4 py-4 text-left border-b border-gray-50 hover:bg-brand-50 transition ${selected?.id === m.id ? 'bg-brand-50' : ''}`}
            >
              <div className="text-2xl flex-shrink-0">{getCategoryEmoji(m.category)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{m.business_name}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{m.address ?? m.category}</div>
                {m.offers[0] && (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    🎁 {m.offers[0].title}
                  </div>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm px-4">
              No businesses match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet for selected merchant */}
      {selected && (
        <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl p-5 max-h-[50vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{getCategoryEmoji(selected.category)}</div>
              <div>
                <div className="font-bold text-gray-900">{selected.business_name}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {selected.address ?? selected.category}
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 rounded-full bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          {selected.offers.length > 0 && (
            <div className="space-y-2 mb-4">
              {selected.offers.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl bg-green-50 p-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <div className="text-sm font-semibold text-green-800">{o.title}</div>
                    <div className="text-xs text-green-600">
                      {o.offer_type === 'discount' ? `${o.discount_value}% off` : 'Free item'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/join" className="btn-primary w-full justify-center">
            Get My Free Card to Claim
          </Link>
        </div>
      )}
    </div>
  )
}
