import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar — Álbum de Tini',
  robots: { index: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  // En Next 16 `searchParams` es una promesa.
  const { next, error } = await searchParams
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/mis-albumes'

  return (
    <main className="relative grid min-h-dvh place-items-center px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(138,0,106,0.4) 0%, rgba(41,0,35,0.7) 45%, #160019 100%)',
        }}
      />
      <LoginForm next={destination} googleError={error === 'google-fallo'} />
    </main>
  )
}
