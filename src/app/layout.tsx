import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'MagicFishbowl — Turn Foot Traffic Into Loyal Customers',
    template: '%s | MagicFishbowl',
  },
  description:
    'MagicFishbowl helps local businesses grow their customer list with QR-powered giveaways, automated follow-up, and a consumer discovery map.',
  keywords: ['local business', 'lead capture', 'loyalty', 'QR code', 'giveaway', 'CRM'],
  openGraph: {
    title: 'MagicFishbowl',
    description: 'Turn foot traffic into loyal customers.',
    url: 'https://magicfishbowl.com',
    siteName: 'MagicFishbowl',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MagicFishbowl',
    description: 'Turn foot traffic into loyal customers.',
  },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
