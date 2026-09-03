'use client'

/**
 * Diálogo de confirmación genérico para acciones destructivas.
 *
 * No hay color "peligro" en la paleta (rosas/violetas/magentas solamente), así
 * que el botón de confirmar reutiliza `hot-pink`, igual que el resto de
 * acciones destructivas del proyecto (el "Quitar" de `CreateAlbumForm`).
 */

import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-deep/80 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-soft-pink/25 bg-dark-violet/95 p-6 text-center shadow-[var(--shadow-polaroid-lg)]"
          >
            <p id="confirm-dialog-title" className="font-script text-2xl text-paper">
              {title}
            </p>
            <p className="mt-2 text-sm text-paper-lilac/60">{description}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="rounded-full border border-soft-pink/25 px-5 py-2 text-sm text-soft-pink transition-colors hover:border-hot-pink/50 hover:text-hot-pink disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="rounded-full bg-hot-pink px-5 py-2 text-sm font-medium text-deep transition-transform hover:scale-[1.02] disabled:opacity-40"
              >
                {busy ? 'Borrando…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
