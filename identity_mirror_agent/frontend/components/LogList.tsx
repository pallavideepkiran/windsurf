const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
import { useEffect, useState } from 'react'

type Log = {
  id: number
  text: string
  summary?: string
  sentiment?: string
  created_at: string
}

export default function LogList({ userId }: { userId: number }) {
  const [logs, setLogs] = useState<Log[]>([])

  const load = async () => {
    const resp = await fetch(`${API_BASE}/summary/${userId}`)
    const data = await resp.json()
    setLogs(data.logs || [])
  }

  useEffect(() => { load() }, [userId])

  return (
    <div>
      {logs.length === 0 && <p>No logs yet.</p>}
      {logs.map(l => (
        <div key={l.id} className="card">
          <div><strong>{new Date(l.created_at).toLocaleString()}</strong></div>
          <div>{l.text}</div>
          <div><em>Summary:</em> {l.summary || 'N/A'} | <em>Sentiment:</em> {l.sentiment || 'N/A'}</div>
        </div>
      ))}
    </div>
  )
}
