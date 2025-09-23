import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <h1>Identity Mirror Agent</h1>
      <nav className="nav">
        <Link href="/journal">Journal</Link>
        <Link href="/history">History</Link>
        <Link href="/mirror">Mirror</Link>
      </nav>
      <p>Welcome! Start by writing your first journal entry.</p>
    </main>
  )
}
