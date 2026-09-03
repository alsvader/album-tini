'use client'

import { useEffect, useRef, useState } from 'react'

type Options = {
  /** ms por carácter. */
  speed?: number
  /** Espera antes del primer carácter, ms. */
  startDelay?: number
  /** Si es false el texto no se escribe: queda vacío hasta que se habilite. */
  enabled?: boolean
  /** Muestra el texto completo de inmediato (reduced motion o ya visto). */
  instant?: boolean
  onDone?: () => void
}

/**
 * Escritura carácter a carácter con reloj de requestAnimationFrame.
 *
 * Se usa rAF y no setInterval por dos razones: el intervalo acumula deriva y
 * sigue corriendo en pestañas de fondo, mientras que rAF se pausa solo y
 * permite acumular el tiempo real transcurrido —si el navegador se salta
 * frames, avanza varios caracteres en vez de retrasarse—.
 */
export function useTypewriter(
  text: string,
  { speed = 46, startDelay = 380, enabled = true, instant = false, onDone }: Options = {},
): { output: string; isTyping: boolean; isDone: boolean } {
  const [count, setCount] = useState(0)
  const [isDone, setIsDone] = useState(false)

  // En un ref para que cambiar el callback no reinicie la animación.
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!enabled) {
      setCount(0)
      setIsDone(false)
      return
    }

    if (instant || text.length === 0) {
      setCount(text.length)
      setIsDone(true)
      onDoneRef.current?.()
      return
    }

    setCount(0)
    setIsDone(false)

    let frame = 0
    let start = 0
    let cancelled = false

    const tick = (now: number) => {
      if (cancelled) return
      if (start === 0) start = now

      const elapsed = now - start - startDelay

      if (elapsed >= 0) {
        const chars = Math.min(text.length, Math.floor(elapsed / speed) + 1)
        setCount(chars)

        if (chars >= text.length) {
          setIsDone(true)
          onDoneRef.current?.()
          return
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [enabled, instant, speed, startDelay, text])

  return {
    output: text.slice(0, count),
    isTyping: enabled && !isDone && count > 0,
    isDone,
  }
}
