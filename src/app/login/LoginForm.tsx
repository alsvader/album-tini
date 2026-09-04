'use client'

/**
 * Formulario de acceso y registro, con los dos modos en la misma pantalla.
 *
 * `useActionState` sobre Server Actions: el `<form action={…}>` funciona incluso
 * sin JavaScript, y `pending` da el estado de envío sin gestionarlo a mano.
 */

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signIn, signUp, signInWithGoogle, type AuthState } from './actions'
import { Doodle } from '@/components/ui/Doodle'

type Mode = 'entrar' | 'crear'

type Props = {
  next: string
  googleError?: boolean
}

/** Logotipo de Google: marca multicolor, no un doodle de trazo. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.4-5.4C34.5 5.3 29.5 3.2 24 3.2 12.6 3.2 3.2 12.6 3.2 24S12.6 44.8 24 44.8 44.8 35.4 44.8 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.9 4.3c1.6-3.9 5.4-6.8 9.9-6.8 3.1 0 5.8 1.1 8 3l5.4-5.4C31.9 6.5 28.1 4.8 24 4.8c-7.2 0-13.4 4.1-16.5 10.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.8c4.4 0 8.5-1.7 11.6-4.4l-5.3-4.5c-1.5 1.1-3.6 1.8-6.3 1.8-5.3 0-9.7-3.4-11.3-8.1l-5.9 4.5C9.9 40.4 16.4 44.8 24 44.8z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.1 5.4l5.3 4.5c-.4.3 6.3-4.6 6.3-13.6 0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  )
}

export function LoginForm({ next, googleError }: Props) {
  const [mode, setMode] = useState<Mode>('entrar')
  const action = mode === 'entrar' ? signIn : signUp
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null)

  const isSignUp = mode === 'crear'

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
        <Doodle name="flower" className="h-6 w-6 text-hot-pink" />
        <span className="font-script text-xl text-paper">Álbum de Tini</span>
      </Link>

      <h1 className="text-center font-script text-[clamp(2rem,7vw,2.8rem)] text-paper">
        {isSignUp ? 'Crea tu cuenta' : 'Entra a tu diario'}
      </h1>
      <p className="mt-3 text-center text-sm text-paper-lilac/60">
        {isSignUp
          ? 'Necesitas una cuenta para guardar tus álbumes.'
          : 'Para volver a tus álbumes y crear otros.'}
      </p>

      {/* El modo viaja en el form: sin JS, el submit sigue sabiendo qué hacer. */}
      <form action={formAction} className="mt-9 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <label className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/70">
            Correo
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-xl border border-soft-pink/25 bg-dark-violet/40 px-4 py-3 text-paper outline-none transition-colors placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
            placeholder="tu@correo.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-soft-pink/70">
            Contraseña
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={isSignUp ? 8 : undefined}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="rounded-xl border border-soft-pink/25 bg-dark-violet/40 px-4 py-3 text-paper outline-none transition-colors placeholder:text-paper-lilac/30 focus:border-hot-pink/60"
            placeholder={isSignUp ? 'al menos 8 caracteres' : '••••••••'}
          />
        </label>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-hot-pink px-6 py-3.5 text-sm font-medium text-deep transition-transform duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {pending ? 'Un momento…' : isSignUp ? 'Crear cuenta' : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(isSignUp ? 'entrar' : 'crear')}
        className="mt-6 w-full text-center text-sm text-soft-pink/70 underline decoration-soft-pink/25 underline-offset-4 transition-colors hover:text-hot-pink"
      >
        {isSignUp ? 'Ya tengo cuenta' : 'No tengo cuenta todavía'}
      </button>

      <div className="mt-10 border-t border-soft-pink/10 pt-8">
        {googleError && (
          <p role="alert" className="mb-4 rounded-xl bg-magenta/20 px-4 py-3 text-sm text-soft-pink">
            No hemos podido entrar con Google. Inténtalo de nuevo.
          </p>
        )}
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-soft-pink/25 px-6 py-3 text-sm text-paper transition-colors hover:border-hot-pink/60 hover:text-hot-pink"
          >
            <GoogleIcon className="h-4 w-4" />
            Continuar con Google
          </button>
        </form>
      </div>
    </div>
  )
}
