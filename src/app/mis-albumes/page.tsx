import type { Metadata } from 'next'
import Link from 'next/link'
import { getMyAlbums } from '@/lib/albums'
import { AppNav } from '@/components/landing/AppNav'
import { Doodle } from '@/components/ui/Doodle'

export const metadata: Metadata = {
  title: 'Mis álbumes — Álbum de Tini',
  robots: { index: false },
}

const formatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Listado de los álbumes del usuario.
 *
 * Server Component: la consulta va con la sesión por cookie, así que RLS ya
 * limita las filas a las suyas y no hace falta filtrar por `owner_id` aquí.
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
              <li key={album.id}>
                <Link
                  href={`/album/${album.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-soft-pink/15 bg-dark-violet/25 px-5 py-4 transition-colors hover:border-hot-pink/45"
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
