'use client'

/**
 * Envoltorio mínimo de GSAP con limpieza automática.
 *
 * Se implementa aquí en vez de añadir @gsap/react porque lo único que hace
 * falta es un `gsap.context` atado al ciclo de vida del efecto: el contexto
 * registra cada tween creado dentro y `revert()` los deshace al desmontar o al
 * cambiar las dependencias. Sin esto, un componente que se desmonta a mitad de
 * animación deja tweens escribiendo sobre objetos ya descartados.
 *
 * Cada animación vive en su propio hook/efecto: no hay un useEffect gigante
 * concentrando toda la coreografía.
 */

import { useEffect, type DependencyList } from 'react'
import gsap from 'gsap'

type Setup = (g: typeof gsap, context: gsap.Context) => void | (() => void)

export function useGSAP(setup: Setup, deps: DependencyList = []): void {
  useEffect(() => {
    let cleanup: void | (() => void)

    // La callback se ejecuta de forma síncrona dentro de gsap.context(), así
    // que no se puede referenciar la variable que aún está asignándose: el
    // propio contexto llega como argumento (`self`).
    const context = gsap.context((self) => {
      cleanup = setup(gsap, self)
    })

    return () => {
      cleanup?.()
      context.revert()
    }
    // El llamador declara sus dependencias, igual que con useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap }
