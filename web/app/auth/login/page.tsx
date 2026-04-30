'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="page-shell auth-shell">
      <section className="card auth-card">
        <div className="eyebrow">Welcome back</div>
        <h1 className="display-title page-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="stack">
          <label className="field-stack">
            <span className="field-label">Email</span>
            <input className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="field-stack">
            <span className="field-label">Password</span>
            <input
              className="text-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <div className="auth-error">{error}</div> : null}

          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter dashboard'}
          </button>
        </form>

        <p className="muted-copy" style={{ marginTop: '1.1rem' }}>
          Need an account? <Link href="/auth/signup" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
      </section>
    </main>
  )
}
