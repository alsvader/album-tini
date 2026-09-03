/**
 * Variables de entorno de Supabase, validadas en un único sitio.
 *
 * Se comprueban al importar para que la falta de configuración falle con un
 * mensaje claro en el arranque, en vez de con un `undefined` que reaparece más
 * tarde como un 401 difícil de rastrear.
 *
 * Sólo la URL y la clave anónima: todo el acceso pasa por RLS, así que la
 * service-role key no hace falta en ninguna parte de la aplicación.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y rellénala ` +
        `(con Supabase local, los valores salen de \`npx supabase status\`).`,
    )
  }
  return value
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)

export const SUPABASE_ANON_KEY = required(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

/** Bucket de las fotos de los álbumes. */
export const PHOTOS_BUCKET = 'album-photos'
