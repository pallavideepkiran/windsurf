import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

interface Log {
  id: number
  text: string
  summary?: string
  sentiment?: string
  created_at: string
}

export default function HistoryPage() {
  const [userId, setUserId] = useState<number | ''>('')
  const [logs, setLogs] = useState<Log[]>([])
  const [combined, setCombined] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    if (typeof userId !== 'number' || isNaN(userId)) {
      setLogs([])
      setCombined('')
      setError('Please enter a valid User ID to view history.')
      return
    }
    try {
      const resp = await fetch(`${API_BASE}/summary/${userId}`)
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setLogs(data.logs)
      setCombined(data.combined_summary)
    } catch (e: any) {
      setError('Error: ' + e.message)
    }
  }

  // No auto-load on mount; user must enter a valid ID and click.

  return (
    <main className="container">
      <h1>History</h1>
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
      <button onClick={load} disabled={!(typeof userId === 'number' && !isNaN(userId))}>Refresh</button>
      {error && <p>{error}</p>}
      {!(typeof userId === 'number' && !isNaN(userId)) ? (
        <p>Enter your User ID above to view your last logs and summary.</p>
      ) : (
        <>
          <section>
            <h2>Combined Summary</h2>
            <p>{combined}</p>
          </section>
          <section>
            <h2>Last Logs</h2>
            {logs.length === 0 && <p>No logs yet.</p>}
            {logs.map(l => (
              <div key={l.id} className="card">
                <div><strong>{new Date(l.created_at).toLocaleString()}</strong></div>
                <div>{l.text}</div>
                <div><em>Summary:</em> {l.summary || 'N/A'} | <em>Sentiment:</em> {l.sentiment || 'N/A'}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
