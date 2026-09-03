import type { Metadata } from 'next'
import Link from 'next/link'
import { getMyAlbums } from '@/lib/albums'
import { AppNav } from '@/components/landing/AppNav'
import { CopyLinkButton } from '@/components/ui/CopyLinkButton'
import { Doodle } from '@/components/ui/Doodle'
import { ShareWhatsAppButton } from '@/components/ui/ShareWhatsAppButton'

export const metadata: Metadata = {
  title: 'Mis álbumes — Álbum de Tini',
  robots: { index: false },
}

const formatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Listado de los álbumes del usuario.
 *
 * Server Component: la consulta va con la sesión por cookie. Ojo, RLS **no**
 * basta aquí: las políticas de un mismo comando se combinan con OR y sobre
 * `albums` hay también una de lectura pública de los publicados, así que el
 * filtro por `owner_id` de `getMyAlbums()` es imprescindible —el porqué está
 * entero en la cabecera de esa función, en `src/lib/albums.ts`—.
 *
 * El action de publicar hace `revalidatePath` sobre esta ruta, que es lo que
 * evita que un álbum recién creado no aparezca.
 */
export default async function MyAlbumsPage() {
  const albums = await getMyAlbums()

  return (
    <main className="relative min-h-dvh px-6 pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(138,0,106,0.32) 0%, rgba(41,0,35,0.65) 45%, #160019 100%)',
        }}
      />
      <AppNav />

      <div className="mx-auto w-full max-w-3xl pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-script text-[clamp(2.2rem,7vw,3.4rem)] text-paper">Mis álbumes</h1>
          <Link
            href="/crear"
            className="rounded-full bg-hot-pink px-6 py-3 text-sm font-medium text-deep transition-transform duration-300 hover:scale-[1.02]"
          >
            Crear álbum
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-soft-pink/20 px-6 py-16 text-center">
            <Doodle name="heart" className="mx-auto h-10 w-10 text-hot-pink/50" />
            <p className="mt-5 font-script text-2xl text-paper">Todavía no hay nada aquí</p>
            <p className="mx-auto mt-3 max-w-[34ch] text-sm text-paper-lilac/55">
              Crea tu primer álbum y tendrás un enlace para compartirlo.
            </p>
          </div>
        ) : (
          <ul className="mt-12 flex flex-col gap-3">
            {albums.map((album) => (
              <li
                key={album.id}
                className="group rounded-2xl border border-soft-pink/15 bg-dark-violet/25 transition-colors hover:border-hot-pink/45"
              >
                <Link
                  href={`/album/${album.slug}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-script text-2xl text-paper">{album.title}</p>
                    <p className="mt-1 text-xs text-paper-lilac/45">
                      {album.photoCount} {album.photoCount === 1 ? 'foto' : 'fotos'}
                      {' · '}
                      {formatter.format(new Date(album.createdAt))}
                      {!album.published && ' · borrador'}
                    </p>
                  </div>
                  <Doodle
                    name="arrowNext"
                    className="h-5 w-5 flex-none text-soft-pink/40 transition-colors group-hover:text-hot-pink"
                  />
                </Link>
                <div className="flex items-center gap-2 border-t border-soft-pink/10 px-5 py-3">
                  <Link
                    href={`/mis-albumes/${album.slug}/editar`}
                    aria-label="Editar álbum"
                    title="Editar álbum"
                    className="grid h-9 w-9 place-items-center rounded-full border border-soft-pink/25 text-soft-pink transition-colors duration-300 hover:border-hot-pink/50 hover:text-hot-pink"
                  >
                    <Doodle name="pencil" className="h-4 w-4" />
                  </Link>
                  {album.published && (
                    <>
                      <CopyLinkButton slug={album.slug} />
                      <ShareWhatsAppButton slug={album.slug} title={album.title} />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
