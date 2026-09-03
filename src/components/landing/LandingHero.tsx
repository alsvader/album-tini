'use client'

/**
 * Hero de la landing.
 *
 * Sin canvas WebGL a propósito: el diario 3D es el momento de impacto de la
 * experiencia y montarlo aquí duplicaría el coste de arranque de la primera
 * visita. El clima se consigue con los glow del pack y los doodles, que ya
 * existen y pesan kilobytes.
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ASSETS } from '@/lib/assets'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Doodle } from '../ui/Doodle'

const FLOATING = [
  { name: 'heart', className: 'left-[8%] top-[18%] h-10 w-10 text-hot-pink/70', delay: 0.5 },
  { name: 'musicNote', className: 'right-[11%] top-[24%] h-9 w-9 text-soft-pink/70', delay: 0.7 },
  { name: 'star', className: 'left-[14%] bottom-[16%] h-7 w-7 text-electric/70', delay: 0.9 },
  { name: 'sparkle', className: 'right-[16%] bottom-[22%] h-6 w-6 text-cyan/60', delay: 1.1 },
] as const

export function LandingHero() {
  const reducedMotion = useReducedMotion()

  /**
   * Con la preferencia activa se omite el estado inicial: framer pinta el
   * elemento directamente en su sitio, sin desplazamiento ni escala.
   *
   * Hasta ahora la landing ignoraba `prefers-reduced-motion` porque la
   * sincronización con matchMedia sólo corría dentro del diario; la hace
   * <MotionPreference /> en el layout raíz.
   */
  const entrance = (from: Record<string, number>, delay: number) =>
    reducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0, scale: 1, rotate: 0 } }
      : {
          initial: from,
          animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Glows del pack, detrás de todo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[18%] left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 opacity-70"
        style={{
          backgroundImage: `url(${ASSETS.environment.glowMagenta})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[22%] -left-[10%] h-[60vmin] w-[60vmin] opacity-50"
        style={{
          backgroundImage: `url(${ASSETS.environment.glowViolet})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {FLOATING.map((item) => (
        <motion.div
          key={item.name}
          aria-hidden="true"
          className={`pointer-events-none absolute hidden sm:block ${item.className}`}
          {...entrance({ opacity: 0, scale: 0.6, rotate: -10 }, item.delay)}
        >
          <Doodle name={item.name} className="h-full w-full" />
        </motion.div>
      ))}

      <motion.p
        className="text-[0.7rem] uppercase tracking-[0.34em] text-soft-pink/80"
        {...entrance({ opacity: 0, y: 10 }, 0)}
      >
        tu propio diario
      </motion.p>

      <motion.h1
        className="mt-4 font-script text-[clamp(3rem,11vw,7rem)] leading-[0.9] text-paper drop-shadow-[0_0_40px_rgba(255,36,228,0.35)]"
        {...entrance({ opacity: 0, y: 18 }, 0.1)}
      >
        Álbum de Tini
      </motion.h1>

      <motion.p
        className="mt-6 max-w-[46ch] text-balance-tight text-base leading-relaxed text-paper-lilac/75 sm:text-lg"
        {...entrance({ opacity: 0, y: 14 }, 0.25)}
      >
        Convierte tus fotos en un diario que se abre de verdad: instantáneas
        pegadas a mano, notas escritas con tu letra y un enlace para compartirlo
        con quien quieras.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        {...entrance({ opacity: 0, y: 14 }, 0.4)}
      >
        <Link
          href="/crear"
          className="rounded-full bg-hot-pink px-8 py-3.5 text-sm font-medium tracking-wide text-deep shadow-[0_0_32px_-6px_rgba(255,36,228,0.7)] transition-transform duration-300 hover:scale-[1.03]"
        >
          Crear mi álbum
        </Link>
        <Link
          href="/demo"
          className="rounded-full border border-soft-pink/35 px-8 py-3.5 text-sm tracking-wide text-soft-pink transition-colors duration-300 hover:border-hot-pink/70 hover:text-hot-pink"
        >
          Ver un ejemplo
        </Link>
      </motion.div>
    </section>
  )
}
