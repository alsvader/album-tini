import type { Metadata } from 'next'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { MAX_CAPTION, MAX_PHOTOS } from '@/lib/albumRules'

export const metadata: Metadata = {
  title: 'Términos del servicio — Álbum de Tini',
  description: 'Qué puedes esperar de Álbum de Tini y qué se espera de ti al usarlo.',
}

export default async function TermsPage() {
  const user = await getUser()

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-deep">
      <LandingNav signedIn={Boolean(user)} />

      <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 sm:px-12">
        <h1 className="font-script text-[clamp(2.2rem,7vw,3.4rem)] text-paper">
          Términos del servicio
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-paper-lilac/40">
          Última actualización: 4 de septiembre de 2026
        </p>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Qué es esto</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Álbum de Tini es un proyecto personal y gratuito. Se ofrece «tal cual»: se cuida
              con cariño, pero no hay garantía de disponibilidad continua ni de que vaya a
              existir para siempre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Tu cuenta</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Hace falta una cuenta (con correo y contraseña, o con Google) para crear y editar
              álbumes. Eres responsable de mantener tu acceso seguro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Tu contenido</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Las fotos y descripciones que subes son tuyas y tú eres responsable de ellas: no
              subas nada que no te pertenezca o cuyo uso no tengas derecho a compartir, ni
              contenido ilegal o dañino.
            </p>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Cada álbum admite hasta {MAX_PHOTOS} fotos, con una descripción de hasta{' '}
              {MAX_CAPTION} caracteres cada una.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">
              Quién puede ver un álbum
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Publicar un álbum lo hace visible para cualquiera con el enlace, sin necesidad de
              cuenta. No se indexa en buscadores, pero el enlace por sí solo abre el álbum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Terminar tu cuenta</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Puedes eliminar tu cuenta en cualquier momento desde «Mis álbumes». Es permanente:
              se borran todos tus álbumes y fotos, y los enlaces que hayas compartido dejan de
              funcionar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Cambios a estos términos</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Si algo cambia en cómo funciona el servicio, se actualiza esta página y su fecha de
              arriba.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Contacto</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Para cualquier duda sobre estos términos, escribe a{' '}
              <a
                href="mailto:aaronlopezsosa@gmail.com"
                className="text-soft-pink underline decoration-soft-pink/30 underline-offset-4 hover:text-hot-pink"
              >
                aaronlopezsosa@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-16 text-sm text-paper-lilac/50">
          <Link href="/privacidad" className="text-soft-pink underline decoration-soft-pink/30 underline-offset-4 hover:text-hot-pink">
            Política de privacidad
          </Link>
        </p>
      </div>

      <LandingFooter />
    </main>
  )
}
