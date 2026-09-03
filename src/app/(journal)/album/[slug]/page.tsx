import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IntroExperience } from '@/components/experience/IntroExperience'
import { getAlbumBySlug } from '@/lib/albums'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const found = await getAlbumBySlug(slug)

  if (!found) return { title: 'Álbum no encontrado', robots: { index: false } }

  return {
    title: `${found.album.meta.title} — Álbum de Tini`,
    description: found.album.meta.subtitle,
    // La visibilidad acordada es «público con el enlace»: se puede abrir, pero
    // no debe acabar en un buscador. Son fotos personales de los usuarios.
    robots: { index: false, follow: false },
    openGraph: {
      title: found.album.meta.title,
      description: found.album.meta.subtitle,
      // Vista previa al compartir el enlace.
      images: found.photoUrls[0] ? [{ url: found.photoUrls[0] }] : undefined,
    },
  }
}

/**
 * Álbum publicado.
 *
 * No comprueba permisos: las políticas de RLS ya devuelven cero filas si el
 * álbum no existe, no está publicado o no es del visitante. Aquí sólo se
 * traduce ese vacío a un 404, que además evita revelar si un slug existe.
 */
export default async function AlbumPage({ params }: Params) {
  const { slug } = await params
  const found = await getAlbumBySlug(slug)

  if (!found) notFound()

  return <IntroExperience album={found.album} />
}
