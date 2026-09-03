'use client'

/**
 * Sustituto de la escena 3D cuando no hay WebGL.
 *
 * No es una pantalla de error: se entra directamente al álbum, que es el
 * contenido. La parte 3D es la puesta en escena, no el fondo del asunto.
 */

import { useEffect, useState } from 'react'

/** Detecta soporte de WebGL una sola vez, creando un contexto de prueba. */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const context =
        canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl')
      setSupported(Boolean(context))
    } catch {
      setSupported(false)
    }
  }, [])

  return supported
}

export function NoWebGLNotice() {
  return (
    <p className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2 text-center text-xs text-soft-pink/60">
      Mostrando el álbum en modo simplificado
    </p>
  )
}
