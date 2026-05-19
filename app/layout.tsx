import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AgeVerification } from '@/components/AgeVerification'
import { PwaRegister } from '@/components/PwaRegister'

export const dynamic = "force-dynamic"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'YaFui - Reseñas sinceras de la comunidad',
  description: "Foro de reseñas y preguntas. Ya fui, ya lo viví, y te lo cuento.",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'YaFui',
  },
  icons: {
    icon: [
      { url: '/yafui-favicon.svg', type: 'image/svg+xml' },
      { url: '/yafui-favicon.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'YaFui - Reseñas sinceras de la comunidad',
    description: 'Foro de reseñas y preguntas. Ya fui, ya lo viví, y te lo cuento.',
    images: [{ url: '/yafui-og-image.png', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Saltar al contenido principal
        </a>
        <AgeVerification />
        <PwaRegister />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}