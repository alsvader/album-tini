import type { Metadata, Viewport } from 'next'
import { Dancing_Script, Poppins } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Diario de Tini',
  description:
    'Un diario digital interactivo: fotografías instantáneas, notas escritas a mano y un poco de magia.',
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
    <html lang="es" className={`${poppins.variable} ${dancingScript.variable}`}>
      <body>
        <MotionPreference />
        {children}
      </body>
    </html>
  )
}
