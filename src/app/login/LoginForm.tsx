'use client'

/**
 * Formulario de acceso y registro, con los dos modos en la misma pantalla.
 *
 * `useActionState` sobre Server Actions: el `<form action={…}>` funciona incluso
 * sin JavaScript, y `pending` da el estado de envío sin gestionarlo a mano.
 */

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signIn, signUp, type AuthState } from './actions'
import { Doodle } from '@/components/ui/Doodle'

type Mode = 'entrar' | 'crear'

type Props = {
  next: string
}

export function LoginForm({ next }: Props) {
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

      {/*
        Acceso con Facebook: escrito y deshabilitado a propósito.
        Activarlo es configuración, no código — las claves en supabase/config.toml
        y en el panel de producción — más cambiar este botón por
        `signInWithOAuth({ provider: 'facebook', options: { redirectTo: '…/auth/callback' } })`.
      */}
      <div className="mt-10 border-t border-soft-pink/10 pt-8">
        <button
          type="button"
          disabled
          title="Disponible en cuanto se configuren las claves de Facebook"
          className="w-full cursor-not-allowed rounded-full border border-soft-pink/15 px-6 py-3 text-sm text-paper-lilac/30"
        >
          Continuar con Facebook
        </button>
        <p className="mt-3 text-center text-xs text-paper-lilac/35">Muy pronto</p>
      </div>
    </div>
  )
}
