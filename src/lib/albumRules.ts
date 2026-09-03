/**
 * Reglas y límites de los álbumes, y la URL pública de una foto.
 *
 * Vive aparte de `lib/albums.ts` a propósito: ese módulo importa el cliente de
 * Supabase para servidor, que a su vez usa `next/headers`. Si el formulario de
 * creación —un componente de cliente— importara las constantes de allí,
 * arrastraría todo eso al bundle del navegador y el build falla. Aquí sólo hay
 * valores y funciones puras, así que se puede importar desde cualquier lado.
 */

import { PHOTOS_BUCKET, SUPABASE_URL } from './supabase/env'

/**
 * Tope de fotos por álbum.
 *
 * `DesktopBook` monta todas las hojas a la vez, cada una con dos páginas y sus
 * capas de fondo, así que el coste crece de forma lineal. 24 fotos son 13 hojas
 * y 26 páginas simultáneas: funciona, y por encima de ahí habría que paginar
 * las hojas por ventana antes de subir el límite.
 */
export const MAX_PHOTOS = 24

/**
 * Tope de la descripción.
 *
 * La franja inferior de la Polaroid es pequeña: a partir de unos 60 caracteres
 * el texto parte en dos líneas y aprieta la composición.
 */
export const MAX_CAPTION = 60

/**
 * URL pública de una foto.
 *
 * Se construye a mano en lugar de llamar a `getPublicUrl` para no necesitar un
 * cliente de Supabase en los componentes que sólo pintan: el bucket es público
 * y el formato de la ruta es estable.
 */
export function photoUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTOS_BUCKET}/${storagePath}`
}

/**
 * URL pública de un álbum para compartir.
 *
 * Se resuelve contra `window.location.origin` en vez de una env var de
 * dominio propia (no existe ninguna hoy): el origen del visitante es siempre
 * el correcto, tanto en producción como en preview.
 */
export function albumUrl(slug: string): string {
  if (typeof window === 'undefined') return `/album/${slug}`
  return `${window.location.origin}/album/${slug}`
}
