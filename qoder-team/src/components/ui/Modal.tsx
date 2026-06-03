import { useState, useCallback, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export function useModal() {
  const [modal, setModal] = useState<{ title: string; content: ReactNode } | null>(null)

  const open = useCallback((title: string, content: ReactNode) => {
    setModal({ title, content })
  }, [])

  const close = useCallback(() => setModal(null), [])

  const render = () => (
    <Modal open={!!modal} title={modal?.title || ''} onClose={close}>
      {modal?.content}
    </Modal>
  )

  return { open, close, render, isOpen: !!modal }
}
