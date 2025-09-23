import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

type Props = { userId: number }

export default function JournalForm({ userId }: Props) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const submit = async () => {
    if (!text.trim()) {
      setStatus('Please enter some text before submitting.')
      return
    }
    setStatus('Submitting...')
    try {
      const resp = await fetch(`${API_BASE}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, text })
      })
      if (!resp.ok) throw new Error(await resp.text())
      setStatus('Saved!')
      setText('')
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
  }

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Write your reflection..." />
      <button onClick={submit}>Submit</button>
      {status && <p>{status}</p>}
    </div>
  )
}
