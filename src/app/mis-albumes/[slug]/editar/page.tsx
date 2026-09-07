import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAlbumForEdit } from '@/lib/albums'
import { AppNav } from '@/components/landing/AppNav'
import { EditAlbumForm } from './EditAlbumForm'

export const metadata: Metadata = {
  title: 'Editar álbum — Álbum de Tini',
  robots: { index: false },
}

/**
 * Editar un álbum propio: añadir fotos, reordenarlas o borrar el álbum.
 *
 * No vive bajo `(journal)/album/[slug]`: ese grupo bloquea el scroll de toda
 * la página (`<ViewportLock />`, pensado para la experiencia 3D a pantalla
 * completa) y este es un formulario largo. `notFound()` cubre a la vez "no
 * existe" y "no eres el dueño" — mismo criterio que la página del álbum, para
 * no revelar cuál de los dos es.
 */
export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const found = await getAlbumForEdit(slug)

  if (!found) notFound()

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
        <EditAlbumForm
          albumId={found.id}
          title={found.title}
          initialSubtitle={found.subtitle}
          initialClosing={found.closingText}
          initialPhotos={found.photos}
        />
      </div>
    </main>
  )
}
