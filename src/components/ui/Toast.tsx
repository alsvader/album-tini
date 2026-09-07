'use client'

/**
 * Notificación transitoria abajo, centrada. Primer toast del repo: mismo
 * lenguaje visual que `ConfirmDialog`/`LoadingScreen` (AnimatePresence +
 * motion), pero sin backdrop ni foco: es aviso, no diálogo.
 */

import { AnimatePresence, motion } from 'framer-motion'

type Props = { visible: boolean; message: string }

export function Toast({ visible, message }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2',
            'rounded-full border border-soft-pink/25 bg-dark-violet/95 px-4 py-2',
            'text-sm text-paper shadow-[var(--shadow-polaroid-lg)]',
          ].join(' ')}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
