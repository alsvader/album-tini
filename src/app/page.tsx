import type { Metadata } from 'next'
import { getUser } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSteps } from '@/components/landing/LandingSteps'
import { LandingSample } from '@/components/landing/LandingSample'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Álbum de Tini — crea tu diario con tus fotos',
  description:
    'Convierte tus fotos en un diario que se abre de verdad: instantáneas, notas escritas a mano y un enlace para compartirlo.',
}

/**
 * Home.
 *
 * Server component: resuelve la sesión antes de pintar para que la barra
 * superior salga ya con el enlace correcto y no parpadee de «Entrar» a «Mis
 * álbumes» en la hidratación.
 */
export default async function LandingPage() {
  const user = await getUser()

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-deep">
      {/* Fondo de toda la página: el mismo degradado radial del álbum. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(138,0,106,0.45) 0%, rgba(41,0,35,0.7) 45%, #160019 100%)',
        }}
      />

      <LandingNav signedIn={Boolean(user)} />
      <LandingHero />
      <LandingSteps />
      <LandingSample />
      <LandingFooter />
    </main>
  )
}
