import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

type Turn = { role: 'user' | 'assistant', content: string }

export default function MirrorPage() {
  const [userId, setUserId] = useState<number | ''>('')
  const [reflection, setReflection] = useState<string>('')
  const [ready, setReady] = useState<boolean>(false)
  const [history, setHistory] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    if (typeof userId !== 'number' || isNaN(userId)) {
      setReady(false)
      setReflection('')
      setHistory([])
      setError('Please enter a valid User ID to load your reflection.')
      return
    }
    try {
      const resp = await fetch(`${API_BASE}/reflect/${userId}`)
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setReady(data.mirror_ready)
      setReflection(data.reflection || '')
    } catch (e: any) {
      setError('Error: ' + e.message)
    }
  }

  // Do not auto-load on mount. Only load when the user explicitly clicks.

  const send = async () => {
    if (!input.trim()) return
    if (typeof userId !== 'number' || isNaN(userId)) {
      setError('Please enter a valid User ID before chatting.')
      return
    }
    const msg = input
    setInput('')
    setHistory(h => [...h, { role: 'user', content: msg }])
    try {
      const resp = await fetch(`${API_BASE}/mirror-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: msg, history })
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setHistory(h => [...h, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      setError('Error: ' + e.message)
    }
  }

  return (
    <main className="container">
      <h1>Mirror</h1>
      <label>
        User ID:
        <input
          type="number"
          value={userId}
          onChange={e => {
            const v = e.target.value
            if (v === '') setUserId('')
            else setUserId(Number(v))
          }}
          placeholder="Enter your User ID"
        />
      </label>
      <button onClick={load} disabled={!(typeof userId === 'number' && !isNaN(userId))}>
        Load Reflection
      </button>
      {error && <p>{error}</p>}
      {!(typeof userId === 'number' && !isNaN(userId)) ? (
        <p>Enter your User ID above to load your reflection and start chatting.</p>
      ) : ready ? (
        <>
          <section>
            <h2>Reflection</h2>
            <p>{reflection}</p>
          </section>
          <section>
            <h2>Chat</h2>
            <div className="chat">
              {history.map((t, i) => (
                <div key={i} className={`bubble ${t.role}`}>{t.content}</div>
              ))}
            </div>
            <div className="chat-input">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Say something..." />
              <button onClick={send}>Send</button>
            </div>
          </section>
        </>
      ) : (
        <p>Not enough logs yet. Write 5 entries to unlock your mirror.</p>
      )}
    </main>
  )}
