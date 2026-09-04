import type { Metadata, Viewport } from 'next'
import { Dancing_Script, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MotionPreference } from '@/components/ui/MotionPreference'
import './globals.css'

/**
 * Tipografías del art board: Poppins para UI y Dancing Script para los
 * captions manuscritos. Se sirven self-hosted por next/font, así que no hay
 * salto de layout ni petición a un tercero en runtime.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-dancing',
  display: 'swap',
})

/**
 * Dominio real en producción, para que las URLs absolutas de `og:image` no
 * salgan apuntando a localhost. Sin `NEXT_PUBLIC_SITE_URL` (checklist de
 * `.env.example`), cae en localhost — sirve para dev, rompería en prod.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Diario de Tini',
  description:
    'Un diario digital interactivo: fotografías instantáneas, notas escritas a mano y un poco de magia.',
  openGraph: {
    siteName: 'Álbum de Tini',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    // Sin esto, X no muestra `og:image` como imagen grande al compartir.
    card: 'summary_large_image',
  },
  // Prueba de propiedad para Search Console: la exige la verificación de la
  // pantalla de consentimiento OAuth de Google, ya que el dominio es de
  // Vercel y no admite verificación por DNS.
  verification: {
    google: 'yrMFfztc2HGvnadgshSg0lYa4ALw-j5_tvXd-EA1uLw',
  },
}

export const viewport: Viewport = {
  themeColor: '#160019',
  width: 'device-width',
  initialScale: 1,
  // La experiencia ocupa el viewport completo y se navega con gestos.
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${dancingScript.variable}`}
    >
      <body>
        <MotionPreference />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
