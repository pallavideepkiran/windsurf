import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

type Turn = { role: 'user' | 'assistant', content: string }

export default function MirrorChat({ userId }: { userId: number }) {
  const [history, setHistory] = useState<Turn[]>([])
  const [input, setInput] = useState('')

  const send = async () => {
    if (!input.trim()) return
    const msg = input
    setInput('')
    setHistory(h => [...h, { role: 'user', content: msg }])
    const resp = await fetch(`${API_BASE}/mirror-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message: msg, history })
    })
    const data = await resp.json()
    setHistory(h => [...h, { role: 'assistant', content: data.reply }])
  }

  return (
    <div>
      <div className="chat">
        {history.map((t, i) => (
          <div key={i} className={`bubble ${t.role}`}>{t.content}</div>
        ))}
      </div>
      <div className="chat-input">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Say something..." />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
