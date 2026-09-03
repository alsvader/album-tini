import Link from 'next/link'
import { Doodle } from '../ui/Doodle'

export function LandingFooter() {
  return (
    <footer className="relative border-t border-soft-pink/10 px-6 py-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <Doodle name="heart" className="h-7 w-7 text-hot-pink/60" />

        <p className="max-w-[40ch] text-sm leading-relaxed text-paper-lilac/55">
          Hecho para guardar lo que no se quiere olvidar.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-paper-lilac/45">
          <Link href="/demo" className="transition-colors hover:text-soft-pink">
            Ver el ejemplo
          </Link>
          <Link href="/crear" className="transition-colors hover:text-soft-pink">
            Crear un álbum
          </Link>
        </div>
      </div>
    </footer>
  )
}
