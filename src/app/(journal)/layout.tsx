/**
 * Layout de las rutas de pantalla completa: la demo y los álbumes publicados.
 *
 * Es un grupo de rutas —los paréntesis no aparecen en la URL—, así que existe
 * sólo para compartir el bloqueo del viewport entre ambas sin repetirlo.
 */

import { ViewportLock } from '@/components/ui/ViewportLock'

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewportLock />
      {children}
    </>
  )
}
