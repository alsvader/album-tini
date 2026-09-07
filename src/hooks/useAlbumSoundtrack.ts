'use client'

/**
 * Música de fondo del álbum: arranca al entrar en `'album'`, para al salir.
 *
 * Se reintenta el play en el siguiente click del documento si el navegador lo
 * bloquea por falta de gesto: pasa en el único camino que llega a `'album'`
 * sin click real, la salida sin WebGL de `IntroExperience` (pasa por
 * `setState('album')` directamente en un efecto).
 */

import { useEffect, useRef } from 'react'
import { useExperience } from '@/state/experience'

const SOUNDTRACK_SRC = '/soundtrack.mp3'
const VOLUME = 0.35

export function useAlbumSoundtrack(): void {
  const state = useExperience((s) => s.state)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (state !== 'album') return

    if (!audioRef.current) {
      const audio = new Audio(SOUNDTRACK_SRC)
      audio.loop = true
      audioRef.current = audio
    }

    const audio = audioRef.current
    audio.currentTime = 0
    audio.volume = VOLUME

    const attempt = () => audio.play().catch(() => {})

    attempt()

    // Si el navegador bloqueó el play por falta de gesto (caso sin WebGL),
    // el siguiente click en cualquier parte de la página lo reintenta.
    const retry = () => {
      if (!audio.paused) return
      attempt()
    }
    document.addEventListener('click', retry)

    return () => {
      document.removeEventListener('click', retry)
      audio.pause()
    }
  }, [state])

  // Limpieza si la ruta entera se desmonta (p. ej. `BackToAlbumsButton`, que
  // navega sin pasar por `requestClose`/`'closing'`).
  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )
}
