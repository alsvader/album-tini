import type { Metadata } from 'next'
import { CreateAlbumForm } from './CreateAlbumForm'
import { AppNav } from '@/components/landing/AppNav'

export const metadata: Metadata = {
  title: 'Nuevo álbum — Álbum de Tini',
  robots: { index: false },
}

/** El middleware ya garantiza que aquí hay sesión. */
export default function CreatePage() {
  return (
    <main className="relative min-h-dvh px-6 pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(138,0,106,0.32) 0%, rgba(41,0,35,0.65) 45%, #160019 100%)',
        }}
      />
      <AppNav />
      <CreateAlbumForm />
    </main>
  )
}
