'use client'

/**
 * Copia texto al portapapeles y expone un breve estado "copiado" para dar
 * feedback visual, sin repetir el temporizador en cada consumidor.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetMs = 1600) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopied(false), resetMs)
      } catch {
        setCopied(false)
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
