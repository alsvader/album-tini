'use client'

/**
 * Publica `prefers-reduced-motion` en el store, para toda la aplicación.
 *
 * La sincronización vivía sólo dentro de `IntroExperience`, así que en cualquier
 * otra ruta —landing, login, crear, mis álbumes— `useReducedMotion()` devolvía
 * siempre `false` y las animaciones ignoraban la preferencia del sistema. El
 * caso más visible era el trazo animado de `Doodle`, que se dibujaba igual.
 *
 * Va en el layout raíz para que lo herede cualquier ruta, presente y futura, en
 * vez de tener que acordarse de llamarlo página por página. No renderiza nada.
 */

import { useReducedMotionSync } from '@/hooks/useReducedMotion'

export function MotionPreference() {
  useReducedMotionSync()
  return null
}
