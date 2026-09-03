'use client'

/**
 * Bloquea el scroll del documento mientras esté montado.
 *
 * El diario ocupa el viewport exacto y no debe scrollear, pero la landing sí,
 * así que la regla no puede vivir en el `body` global. Se marca un atributo de
 * datos y `globals.css` hace el resto; al desmontarse se limpia, de modo que
 * navegar del álbum a la landing devuelve el scroll.
 */

import { useEffect } from 'react'

export function ViewportLock() {
  useEffect(() => {
    document.body.dataset.viewportLock = 'true'
    return () => {
      delete document.body.dataset.viewportLock
    }
  }, [])

  return null
}
