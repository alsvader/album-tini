'use client'

/**
 * Control de música ambiental.
 *
 * Nada suena hasta que se pulsa: el audio arranca con este gesto y no antes.
 * Si el archivo aún no existe en el pack, el botón se muestra deshabilitado
 * en lugar de fallar al pulsarlo.
 */

import { useAmbientAudio } from '@/hooks/useAmbientAudio'
import { Doodle } from './Doodle'

export function MusicToggle() {
  const { enabled, available, toggle } = useAmbientAudio()

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!available}
      aria-pressed={enabled}
      aria-label={
        !available
          ? 'Música no disponible'
          : enabled
            ? 'Apagar la música'
            : 'Encender la música'
      }
      title={!available ? 'Música no disponible' : enabled ? 'Música encendida' : 'Música apagada'}
      className={[
        'group fixed right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full',
        'border border-soft-pink/25 bg-dark-violet/50 backdrop-blur-[2px]',
        'transition-colors duration-300',
        available ? 'hover:border-hot-pink/60 hover:bg-purple/50' : 'opacity-30',
      ].join(' ')}
    >
      <Doodle
        name="musicNote"
        className={[
          'h-5 w-5 transition-colors duration-300',
          enabled ? 'text-hot-pink' : 'text-soft-pink/55',
        ].join(' ')}
      />
      {/* Barra diagonal cuando está apagada: legible sin depender del color. */}
      {!enabled && (
        <span
          aria-hidden="true"
          className="absolute h-5 w-px rotate-45 bg-soft-pink/55 transition-colors"
        />
      )}
    </button>
  )
}
