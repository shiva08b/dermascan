'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { clearDermatologistSession, saveDermatologistSession } from '@/lib/app-data'

export default function DermatologistLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('')
  const [code, setCode] = useState('')

  return (
    <main className="page-shell auth-shell">
      <section className="card auth-card">
        <div className="eyebrow">Dermatologist access</div>
        <h1 className="display-title page-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Portal Login
        </h1>
        <p className="muted-copy" style={{ marginBottom: '1rem' }}>
          Frontend-only advanced portal for reviewing linked patient progress, analytics, and prescriptions.
        </p>
        <div className="stack">
          <label className="field-stack">
            <span className="field-label">Name</span>
            <input className="text-input" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field-stack">
            <span className="field-label">Clinic</span>
            <input className="text-input" value={clinic} onChange={(event) => setClinic(event.target.value)} />
          </label>
          <label className="field-stack">
            <span className="field-label">Dermatologist ID</span>
            <input className="text-input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. DERM-001" />
          </label>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              clearDermatologistSession()
              saveDermatologistSession({
                name: name || 'Demo Dermatologist',
                clinic: clinic || 'DermaScan Partner Clinic',
                dermatologistId: code || 'DERM-001',
                loggedInAt: new Date().toISOString(),
              })
              router.push('/dermatologist/dashboard')
            }}
          >
            Enter portal
          </button>
        </div>
      </section>
    </main>
  )
}
