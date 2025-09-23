import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function JournalPage() {
  const [userId, setUserId] = useState<number>(1)
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
      const data = await resp.json()
      setStatus('Saved! Summary: ' + (data.summary || 'N/A') + ' | Sentiment: ' + (data.sentiment || 'N/A'))
      setText('')
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
  }

  return (
    <main className="container">
      <h1>Daily Journal</h1>
      <label>
        User ID:
        <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} />
      </label>
      <textarea
        placeholder="Write your reflection for today..."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={8}
      />
      <button onClick={submit}>Submit</button>
      {status && <p>{status}</p>}
    </main>
  )
}
