import { useEffect, useRef } from 'react'

export function ConfirmationDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const opener = document.activeElement
    element.showModal()
    cancel.current?.focus()
    return () => { element.close(); if (opener instanceof HTMLElement && opener.isConnected) opener.focus() }
  }, [])
  return <dialog ref={dialog} className="confirmation-dialog" aria-labelledby="reset-title" aria-describedby="reset-description" onKeyDown={event => {
    if (event.key !== 'Tab') return
    if (event.shiftKey && document.activeElement === cancel.current) { event.preventDefault(); confirm.current?.focus() }
    else if (!event.shiftKey && document.activeElement === confirm.current) { event.preventDefault(); cancel.current?.focus() }
  }} onCancel={event => { event.preventDefault(); onCancel() }} onClick={event => { if (event.target === event.currentTarget) onCancel() }}>
    <h2 id="reset-title">Start a fresh adventure?</h2>
    <p id="reset-description">This will reset completed levels, stars, coins, and future achievements and rewards. Only Level 1 will be unlocked. Your sound preference will stay the same.</p>
    <div className="dialog-actions"><button ref={cancel} className="button button-secondary" onClick={onCancel}>Keep my progress</button><button ref={confirm} className="button danger-button" onClick={onConfirm}>Yes, reset progress</button></div>
  </dialog>
}
