'use client'

/**
 * Detecta si el navegador soporta la Web Share API.
 *
 * Mismo patrón que `useWebGLSupport`: arranca en `false` y se corrige en un
 * efecto, para que el HTML del servidor y el primer render de cliente
 * coincidan y no haya mismatch de hidratación.
 */

import { useCallback, useEffect, useState } from 'react'

type ShareData = { title: string; text?: string; url: string }

export function useWebShare(): { available: boolean; share: (data: ShareData) => void } {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    setAvailable(typeof navigator.share === 'function')
  }, [])

  const share = useCallback((data: ShareData) => {
    // Cancelar la hoja de compartir rechaza la promesa (AbortError): no es un
    // error, así que no hace falta reportarlo.
    navigator.share(data).catch(() => {})
  }, [])

  return { available, share }
}
