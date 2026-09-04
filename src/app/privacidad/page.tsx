import type { Metadata } from 'next'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Política de privacidad — Álbum de Tini',
  description: 'Qué datos guarda Álbum de Tini, para qué se usan y cómo pedir que se borren.',
}

/**
 * Descripción honesta de lo que la app realmente hace con los datos, no un
 * documento redactado por un abogado. Existe para que Google acepte el
 * proveedor de acceso en producción (exige un enlace de privacidad) y para
 * que quien la lea sepa de verdad qué pasa con sus fotos.
 */
export default async function PrivacyPage() {
  const user = await getUser()

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-deep">
      <LandingNav signedIn={Boolean(user)} />

      <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 sm:px-12">
        <h1 className="font-script text-[clamp(2.2rem,7vw,3.4rem)] text-paper">
          Política de privacidad
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-paper-lilac/40">
          Última actualización: 4 de septiembre de 2026
        </p>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Qué es esto</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Álbum de Tini es un proyecto personal, no una empresa. Esta página explica, en
              términos claros, qué datos pide la app, para qué los usa y qué puedes hacer si
              quieres que se borren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Qué datos recopilamos</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Para crear una cuenta: tu correo y una contraseña, o —si entras con Google— el
              nombre, correo y foto de perfil que tu cuenta de Google comparte con nosotros. No
              pedimos nada más para el acceso.
            </p>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Además, lo que tú decides subir: las fotos de tus álbumes y las descripciones que
              escribes para cada una.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Para qué los usamos</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Solo para que la app funcione: identificarte al entrar, guardar tus álbumes y
              mostrárselos a quien tenga el enlace de uno publicado. Nada de esto se usa para
              publicidad ni se vende a nadie.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">
              Con quién se comparten
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Con los proveedores que hacen posible la app: <strong className="text-paper">
                Supabase
              </strong>{' '}
              (autenticación, base de datos y almacenamiento de las fotos),{' '}
              <strong className="text-paper">Google</strong> (solo si eliges entrar con esa
              cuenta) y <strong className="text-paper">Vercel</strong> (donde vive el sitio). No
              hay analítica de terceros ni cookies de rastreo: la única cookie que se usa es la
              de sesión, para mantenerte conectado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">
              Quién puede ver un álbum
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Un álbum publicado es visible para cualquiera que tenga el enlace. No aparece en
              buscadores ni se puede encontrar por casualidad, pero el enlace en sí no pide
              contraseña: trátalo como tratarías compartir esas fotos por mensaje.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">
              Tus datos, tus decisiones
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Desde «Mis álbumes» puedes añadir, editar, reordenar o borrar tus fotos, y borrar
              cualquier álbum entero, en cualquier momento. Si quieres borrar todo —cuenta,
              álbumes y fotos, de forma permanente e inmediata—, hay un botón de{' '}
              <em>Eliminar mi cuenta</em> en esa misma página.
            </p>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Para cualquier otra duda sobre tus datos, escríbenos a{' '}
              <a
                href="mailto:aaronlopezsosa@gmail.com"
                className="text-soft-pink underline decoration-soft-pink/30 underline-offset-4 hover:text-hot-pink"
              >
                aaronlopezsosa@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-paper sm:text-xl">Cambios a esta política</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-paper-lilac/70 sm:text-base">
              Si algo cambia en cómo tratamos los datos, se actualiza esta página y su fecha de
              arriba.
            </p>
          </section>
        </div>

        <p className="mt-16 text-sm text-paper-lilac/50">
          <Link href="/terminos" className="text-soft-pink underline decoration-soft-pink/30 underline-offset-4 hover:text-hot-pink">
            Términos del servicio
          </Link>
        </p>
      </div>

      <LandingFooter />
    </main>
  )
}
