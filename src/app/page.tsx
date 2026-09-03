import type { Metadata } from 'next'
import { getUser } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingJournal } from '@/components/landing/LandingJournal'
import { LandingSteps } from '@/components/landing/LandingSteps'
import { LandingSample } from '@/components/landing/LandingSample'
import { LandingWhy } from '@/components/landing/LandingWhy'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingClosing } from '@/components/landing/LandingClosing'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Álbum de Tini — un diario que se abre de verdad',
  description:
    'Sube tus fotos, escribe qué recuerda cada una y comparte un enlace. Quien lo abra verá tu diario abrirse página a página.',
}

/**
 * Home.
 *
 * Server component: resuelve la sesión antes de pintar para que la barra
 * superior salga ya con el enlace correcto y no parpadee de «Entrar» a «Mis
 * álbumes» en la hidratación. Es lo único que necesita servidor; todas las
 * secciones son estáticas y sólo bajan al navegador `Doodle`, `Polaroid`,
 * `Reveal` y la constelación del hero.
 *
 * Cada sección pone su propio fondo. Antes había un degradado fijo para toda la
 * página, pero el diseño alterna clima por sección —el hero y el cierre son
 * radiales, «el diario» y «así se ve un recuerdo» son verticales— y un fondo
 * único los aplanaba.
 */
export default async function LandingPage() {
  const user = await getUser()

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-deep">
      <LandingNav signedIn={Boolean(user)} />
      <LandingHero />
      <LandingJournal />
      <LandingSteps />
      <LandingSample />
      <LandingWhy />
      <LandingFaq />
      <LandingClosing />
      <LandingFooter />
    </main>
  )
}
