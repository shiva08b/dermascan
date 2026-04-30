'use client'

import Link from 'next/link'
import { ArrowRight, Camera, FileText, Globe2, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  {
    title: 'Track progress over time',
    description: 'Every scan becomes a timeline entry with severity history, confidence trends, and routine context.',
  },
  {
    title: 'Compare before and after',
    description: 'Place any two scans side by side and see whether severity and confidence are improving.',
  },
  {
    title: 'Download a weekly report',
    description: 'Generate a printable summary with scan counts, average severity, and recent recommendations.',
  },
  {
    title: 'Control routines and ingredients',
    description: 'Keep a blacklist, set reminders, and store your preferred language for routine delivery.',
  },
]

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace('/dashboard')
      }
    })
  }, [router])

  return (
    <main className="page-shell landing-shell">
      <div className="landing-frame">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--line)',
            marginBottom: '1.2rem',
          }}
        >
          <div>
            <div className="brand-title">
              <span className="brand-spark">
                <Sparkles size={14} />
              </span>
              <span>DermaScan</span>
            </div>
            <div className="brand-subtitle">AI Skin Clinic</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/auth/login" className="button-secondary">
              Sign in
            </Link>
            <Link href="/auth/signup" className="button-primary">
              Enter dashboard
            </Link>
          </div>
        </div>

        <div className="landing-grid">
          <section className="hero-panel">
            <div className="hero-copy">
              <div className="eyebrow">Dermatology-grade AI workflow</div>
              <h1 className="display-title page-title">A cinematic skin clinic for your acne scans.</h1>
              <p className="muted-copy" style={{ fontSize: '1.05rem', maxWidth: '42rem' }}>
                Upload a face photo, detect acne, receive a structured skincare routine, and monitor how your skin changes
                across time with a dashboard experience that feels like the mockups you shared.
              </p>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link href="/auth/signup" className="button-primary">
                  Start scanning
                  <ArrowRight size={16} />
                </Link>
                <Link href="/auth/login" className="button-secondary">
                  Open existing account
                </Link>
              </div>

              <div className="hero-card-grid">
                <div className="hero-stat">
                  <div className="section-label">Core</div>
                  <div className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.45rem' }}>
                    Scan + routine
                  </div>
                  <div className="muted-copy">Connected to your Railway API and ready for real uploads.</div>
                </div>
                <div className="hero-stat">
                  <div className="section-label">Phase 1</div>
                  <div className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.45rem' }}>
                    Progress + compare
                  </div>
                  <div className="muted-copy">History, weekly reporting, blacklist controls, and preference storage.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="hero-panel" style={{ display: 'grid', gap: '0.9rem' }}>
            {FEATURES.map((feature, index) => (
              <article key={feature.title} className="hero-stat">
                <div className="section-label">0{index + 1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  {index === 0 && <Camera size={16} color="#d47d57" />}
                  {index === 1 && <ShieldCheck size={16} color="#d47d57" />}
                  {index === 2 && <FileText size={16} color="#d47d57" />}
                  {index === 3 && <Globe2 size={16} color="#d47d57" />}
                  <h2 style={{ fontSize: '1.05rem' }}>{feature.title}</h2>
                </div>
                <p className="muted-copy" style={{ lineHeight: 1.8 }}>
                  {feature.description}
                </p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  )
}
