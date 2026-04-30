'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <main className="page-shell auth-shell">
      <section className="card auth-card">
        <div className="eyebrow">Create account</div>
        <h1 className="display-title page-title" style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>
          Join the clinic
        </h1>

        {success ? (
          <div className="stack">
            <p>We sent a confirmation link to {email}.</p>
            <button type="button" className="button-primary" onClick={() => router.push('/auth/login')}>
              Go to login
            </button>
          </div>
        ) : (
          <>
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
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {error ? <div className="auth-error">{error}</div> : null}

              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="muted-copy" style={{ marginTop: '1.1rem' }}>
              Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </>
        )}
      </section>
    </main>
  )
}
