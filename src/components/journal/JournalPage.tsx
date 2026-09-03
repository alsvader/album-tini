'use client'

/**
 * Una página del diario: fondo de papel + contenido.
 *
 * El fondo es inside-page.webp con un velo cálido encima. El patrón del pack
 * es muy denso y las fotografías perderían legibilidad sobre él, así que se
 * atenúa con la textura de papel y un scrim del color de papel cálido. Es el
 * mismo tratamiento que reciben las páginas en la escena 3D, de modo que el
 * crossfade no cambia el aspecto del papel.
 *
 * Los cuatro tipos de página (portadilla, foto, cierre y blanco) se derivan de
 * los datos: no hay páginas escritas a mano en el JSX.
 */

import { motion } from 'framer-motion'
import { ASSETS } from '@/lib/assets'
import { useExperience } from '@/state/experience'
import { fallbackDoodles, type JournalPageContent } from '@/data/spreads'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Doodle } from '../ui/Doodle'
import { PageDoodles } from './PageDoodles'
import { Polaroid } from './Polaroid'

type Props = {
  content: JournalPageContent
  active: boolean
  /** Sombra del pliegue: hacia dónde queda el lomo. */
  spineSide?: 'left' | 'right' | 'none'
  priority?: boolean
  className?: string
}

export function JournalPage({
  content,
  active,
  spineSide = 'none',
  priority = false,
  className,
}: Props) {
  const reducedMotion = useReducedMotion()
  // Se toma del store en vez de recibirlo por props: `Journal3D` ya invoca
  // `requestOpen` así, y pasarlo por `DesktopBook` y `MobileBook` —que no lo
  // usarían para nada más— sólo añadiría superficie.
  const requestClose = useExperience((s) => s.requestClose)

  return (
    <div
      className={[
        'relative h-full w-full overflow-hidden bg-paper-warm',
        className ?? '',
      ].join(' ')}
    >
      {/* Patrón del diario físico. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.journal.insidePage})` }}
      />

      {/* Velo cálido: baja el contraste del patrón para que la foto respire. */}
      <div aria-hidden="true" className="absolute inset-0 bg-paper/34" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `url(${ASSETS.textures.paper})`,
          backgroundSize: '380px',
        }}
      />

      {/* Sombra del lomo y curvatura insinuada, sin geometría extra. */}
      {spineSide !== 'none' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[11%]"
          style={{
            [spineSide]: 0,
            background:
              spineSide === 'left'
                ? 'linear-gradient(90deg, rgba(22,0,25,0.3) 0%, rgba(22,0,25,0.09) 38%, transparent 100%)'
                : 'linear-gradient(270deg, rgba(22,0,25,0.3) 0%, rgba(22,0,25,0.09) 38%, transparent 100%)',
          }}
        />
      )}

      {/* Viñeteado suave en los bordes exteriores. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 5rem rgba(81,0,63,0.16)',
        }}
      />

      {/* ---------- Contenido ---------- */}
      <div className="relative flex h-full w-full items-center justify-center p-[8%]">
        {content.kind === 'photo' && (
          <div className="relative w-full max-w-[min(78%,26rem)]">
            <Polaroid entry={content.entry} active={active} priority={priority} />
            {/* Las fotos de la demo traen sus doodles elegidos a mano; las que
                sube un usuario no, y se derivan de su id. */}
            <PageDoodles
              names={content.entry.doodles ?? fallbackDoodles(content.entry.id)}
              active={active}
            />
          </div>
        )}

        {content.kind === 'title' && (
          <motion.div
            className="flex flex-col items-center gap-5 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Doodle
              name="flower"
              draw={active}
              className="h-12 w-12 text-hot-pink/80"
              delay={0.25}
            />
            <h1 className="font-script text-[clamp(2rem,4.5vw,3.4rem)] leading-none text-purple">
              {content.title}
            </h1>
            <p className="max-w-[32ch] text-balance-tight text-[0.7rem] uppercase tracking-[0.18em] text-magenta/70">
              {content.subtitle}
            </p>
          </motion.div>
        )}

        {content.kind === 'closing' && (
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-script text-[clamp(1.4rem,2.6vw,2.1rem)] text-purple">
              {content.text}
            </p>
            <Doodle
              name="heart"
              draw={active}
              className="h-9 w-9 text-hot-pink/75"
              delay={0.3}
            />

            {/*
              Única salida del álbum, y está aquí porque ésta es la última
              página: la opción de cerrar aparece cuando ya se recorrió el
              diario entero. Discreto como el resto de los controles —esto es un
              diario, no un panel—.
            */}
            <button
              type="button"
              onClick={requestClose}
              aria-label="Cerrar el diario y volver al inicio"
              className={[
                'mt-3 rounded-full border px-6 py-2 transition-all duration-300',
                'border-magenta/30 text-[0.68rem] uppercase tracking-[0.26em] text-magenta/80',
                'hover:border-hot-pink/70 hover:text-hot-pink',
              ].join(' ')}
            >
              Cerrar el diario
            </button>
          </motion.div>
        )}

        {/* 'blank' no dibuja nada: es una página de papel, y eso está bien. */}
      </div>
    </div>
  )
}
