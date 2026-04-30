'use client'
/* eslint-disable @next/next/no-img-element */

import { Lock, Sparkles, Upload, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { usePatientData } from '@/components/use-patient-data'
import { analyzeSkin } from '@/lib/api'
import { insertScan, prepareImageForStorage, saveAsset, uploadScanImage } from '@/lib/app-data'
import type { AIProvider, ScanRecord } from '@/lib/types'

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
  { value: 'cohere', label: 'Cohere' },
  { value: 'huggingface', label: 'HuggingFace' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'combined', label: 'Combined' },
  { value: 'consensus', label: 'Consensus' },
]

export default function ScanPage() {
  const { user, loading, preferences, allowance, subscription } = usePatientData()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [provider, setProvider] = useState<AIProvider>('groq')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function onPick(nextFile: File) {
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    setError('')
  }

  async function handleAnalyze() {
    if (!user || !file || !allowance || !preferences) return
    if (allowance.locked) {
      setError('Free plan limit reached for this month. Upgrade to Pro for unlimited scans.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const [result, storageUrl, imageDataUrl] = await Promise.all([
        analyzeSkin(file, provider, preferences.skinType),
        uploadScanImage(user.id, file),
        prepareImageForStorage(file),
      ])

      const createdScan: ScanRecord = await insertScan(user.id, result, storageUrl ?? imageDataUrl)
      saveAsset(user.id, createdScan.id, storageUrl ?? imageDataUrl ?? preview)

      sessionStorage.setItem(
        'scanResult',
        JSON.stringify({
          result,
          scan: createdScan,
          imageUrl: createdScan.image_url ?? storageUrl ?? imageDataUrl ?? preview,
        }),
      )

      router.push('/results')
    } catch {
      setError('Analysis failed. Please try a clean, front-facing image and run it again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !user || !preferences || !allowance || !subscription) {
    return (
      <main className="page-shell auth-shell">
        <div className="stack" style={{ alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '200px' }} />
          <div className="skeleton skeleton-text" style={{ width: '160px' }} />
        </div>
      </main>
    )
  }

  return (
    <AppShell eyebrow="Capture" title="New Scan">
      <section className="scan-hero-grid">
        <article className="stack">
          <div
            className={`card card-section dropzone${dragging ? ' active' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              const dropped = event.dataTransfer.files[0]
              if (dropped) onPick(dropped)
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(event) => {
                const nextFile = event.target.files?.[0]
                if (nextFile) onPick(nextFile)
              }}
            />

            {preview ? (
              <img src={preview} alt="Scan preview" className="dropzone-preview" />
            ) : (
              <div>
                <Upload size={32} style={{ margin: '0 auto 1rem', color: 'var(--accent)', opacity: 0.7 }} />
                <div className="section-title" style={{ marginBottom: '0.45rem' }}>Drop a face photo</div>
                <div className="muted-copy">or click to browse - JPG/PNG - up to 8MB</div>
              </div>
            )}
          </div>

          <div className="two-col">
            <label className="field-stack">
              <span className="field-label">AI provider</span>
              <select className="text-select" value={provider} onChange={(event) => setProvider(event.target.value as AIProvider)}>
                {PROVIDERS.map((entry) => (
                  <option key={entry.value} value={entry.value}>{entry.label}</option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">Preferred routine language</span>
              <input className="text-input" value={preferences.language} readOnly />
            </label>
          </div>

          <div className="two-col">
            <div className="card card-section">
              <div className="section-label">Plan</div>
              <div className="metric-value" style={{ fontSize: '1.8rem' }}>
                {subscription.tier === 'pro' ? 'Pro' : subscription.trialActive ? 'Trial' : 'Free'}
              </div>
              <div className="metric-caption">{allowance.unlimited ? 'Unlimited scans' : `${allowance.remaining} scans left`}</div>
              {allowance.locked ? (
                <div className="pro-badge" style={{ marginTop: '0.7rem' }}>
                  <Lock size={10} /> Limit reached - upgrade to Pro
                </div>
              ) : null}
            </div>

            <div className="card card-section">
              <div className="section-label">Skin profile</div>
              <div className="metric-value" style={{ fontSize: '1.8rem', textTransform: 'capitalize' }}>{preferences.skinType}</div>
              <div className="metric-caption">Used for product and remedy filtering</div>
            </div>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button
            type="button"
            className="button-primary"
            onClick={handleAnalyze}
            disabled={!file || busy || allowance.locked}
            style={{ width: '100%', minHeight: '50px', fontSize: '0.95rem' }}
          >
            {allowance.locked ? (
              <><Lock size={15} /> Free limit reached</>
            ) : busy ? (
              <><Zap size={15} style={{ animation: 'pulse-glow 1.5s infinite' }} /> Analyzing...</>
            ) : (
              <><Sparkles size={15} /> Analyze</>
            )}
          </button>
        </article>

        <aside className="stack">
          <div className="card card-section">
            <div className="section-label">How it works</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Three steps.</h2>
            <div className="stack">
              <p><span className="step-index">01</span>Upload a clean, well-lit photo of your face with minimal shadows.</p>
              <p><span className="step-index">02</span>Your detector classifies acne type and severity from the model response.</p>
              <p><span className="step-index">03</span>The routine, remedies, products, and progress modules update automatically.</p>
            </div>
          </div>

          <div className="card card-section">
            <div className="section-label">Freemium</div>
            <h2 className="section-title" style={{ fontSize: '1.7rem' }}>
              {subscription.tier === 'pro' ? 'Unlimited scans' : '10 scans / month'}
            </h2>
            <p className="muted-copy">
              Every user starts with a 1-month free trial. Pro unlocks exclusive product discount codes and removes scan caps.
            </p>
            {!subscription.canUseDiscountCodes ? (
              <div className="mini-lock-row">
                <Lock size={14} />
                <span>Pro - Exclusive discount codes locked</span>
              </div>
            ) : (
              <div className="mini-lock-row accent">
                <Sparkles size={14} />
                <span>Pro discounts unlocked</span>
              </div>
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  )
}
