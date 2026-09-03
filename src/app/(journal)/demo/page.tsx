import type { Metadata } from 'next'
import { IntroExperience } from '@/components/experience/IntroExperience'
import { demoAlbum } from '@/data/journal'

export const metadata: Metadata = {
  title: 'Diario de Tini — ejemplo',
  description: 'Un álbum de ejemplo para ver cómo queda antes de crear el tuyo.',
}

/**
 * El álbum de ejemplo que enlaza la landing.
 *
 * Usa el contenido estático de `data/journal.ts`, así que sirve además para
 * probar el diario sin depender de Supabase.
 */
export default function DemoPage() {
  return <IntroExperience album={demoAlbum} />
}
