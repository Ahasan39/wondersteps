import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useProgress } from '../../hooks/useProgress'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

export function ResetProgress() {
  const { resetProgress, persistence } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  function confirmReset() {
    const result = resetProgress()
    setConfirming(false)
    setMessage(result.ok && result.value.persisted ? 'Your adventure is reset and saved.' : 'Your adventure is reset for this session. Your browser could not save the change.')
  }
  return <section className="reset-section" aria-labelledby="reset-section-title">
    <h2 id="reset-section-title">A fresh start</h2><p>Start again from the very first step.</p>
    <button className="reset-button" onClick={() => setConfirming(true)}><RotateCcw size={19}/> Reset progress</button>
    <p className="storage-note">{persistence === 'unavailable' ? 'Browser saving is unavailable. Progress works for this session, but changes may not survive a refresh.' : persistence === 'recovered' ? 'Saved progress needed recovery. A safe adventure state has been loaded.' : 'Your adventure progress is saved on this browser.'}</p>
    <p className="reset-status" role="status">{message}</p>
    {confirming && <ConfirmationDialog onCancel={() => setConfirming(false)} onConfirm={confirmReset}/>}
  </section>
}
