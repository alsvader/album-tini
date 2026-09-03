'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useExperience } from '@/state/experience'

const AUDIO_SRC = '/assets/audio/ambient.mp3'
const STORAGE_KEY = 'album-tini:music'

export type AmbientAudio = {
  enabled: boolean
  /** false si el archivo no existe: el control se muestra deshabilitado. */
  available: boolean
  toggle: () => void
}

/**
 * Música ambiental opcional.
 *
 * Nunca suena sola: el elemento Audio se crea en el primer toggle del usuario,
 * que es también el gesto que las políticas de autoplay exigen. La preferencia
 * se recuerda, pero recordar "on" no reproduce nada hasta que haya interacción.
 *
 * El pack todavía no trae el archivo; si falta, `available` queda en false y el
 * control se deshabilita en lugar de fallar.
 */
export function useAmbientAudio(): AmbientAudio {
  const enabled = useExperience((s) => s.musicEnabled)
  const toggleStore = useExperience((s) => s.toggleMusic)
  const [available, setAvailable] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sólo comprobamos la existencia del archivo; no se descarga el audio.
  useEffect(() => {
    let cancelled = false
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok)
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = useCallback(() => {
    if (!available) return

    if (!audioRef.current) {
      const audio = new Audio(AUDIO_SRC)
      audio.loop = true
      audio.volume = 0
      audioRef.current = audio
    }

    const audio = audioRef.current
    const next = !enabled

    if (next) {
      void audio.play().then(() => {
        // Fade in manual: entrar a volumen pleno resulta brusco.
        const target = 0.35
        const step = () => {
          if (!audioRef.current || audioRef.current.paused) return
          audioRef.current.volume = Math.min(target, audioRef.current.volume + 0.015)
          if (audioRef.current.volume < target) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    } else {
      audio.pause()
      audio.volume = 0
    }

    try {
      localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    } catch {
      /* modo privado: la preferencia simplemente no persiste */
    }

    toggleStore()
  }, [available, enabled, toggleStore])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  return { enabled, available, toggle }
}
