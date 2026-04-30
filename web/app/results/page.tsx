'use client'
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { AlertTriangle, ArrowRight, Bot, Calendar, Microscope } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { ProductCards } from '@/components/product-cards'
import { RemedyCards } from '@/components/remedy-cards'
import { loadPreferences } from '@/lib/app-data'
import { getHomeRemedies, getRecommendedProducts } from '@/lib/experience'
import { ACNE_LABELS, SEVERITY_COLORS, type ProductRecommendation, type HomeRemedy, type ScanRecord, type ScanResult } from '@/lib/types'

interface StoredResultPayload {
  result: ScanResult
  scan: ScanRecord
  imageUrl?: string
}

interface RoutineSection {
  title: string
  items: string[]
}

type ApiProductRecommendation = ProductRecommendation & {
  skin_types?: ProductRecommendation['skinTypes']
  concern_tags?: ProductRecommendation['concernTags']
  pro_discount_code?: string
}

type ApiHomeRemedy = HomeRemedy & {
  best_for?: HomeRemedy['bestFor']
}

function normalizeHeading(value: string) {
  return value
    .replace(/^#+\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/\(step by step\)/gi, '')
    .replace(/_/g, ' ')
    .replace(/:/g, '')
    .trim()
}

function parseRoutine(routine: string) {
  const lines = routine
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const sections: RoutineSection[] = []
  let current: RoutineSection | null = null

  for (const line of lines) {
    const isHeading = /^#+/.test(line) || /^\d+\./.test(line)
    if (isHeading) {
      current = { title: normalizeHeading(line), items: [] }
      sections.push(current)
      continue
    }

    const cleanLine = line.replace(/^[-*]\s*/, '').trim()
    if (!current) {
      current = { title: 'Overview', items: [] }
      sections.push(current)
    }
    current.items.push(cleanLine)
  }

  return sections.length ? sections : [{ title: 'Routine', items: [routine] }]
}

function buildInsights(result: ScanResult) {
  const confidence = `${(result.confidence * 100).toFixed(1)}%`

  if (!result.is_acne) {
    return [
      `The model did not detect active acne in this scan.`,
      `Prediction confidence is ${confidence}.`,
      'A maintenance routine is still recommended to preserve skin barrier health.',
    ]
  }

  return [
    `${ACNE_LABELS[result.acne_type ?? 'null']} was detected with ${confidence} confidence.`,
    `Severity is currently graded as ${result.severity ?? 'not classified'}.`,
    `The routine below is tailored from the lesion pattern and recommendation tags returned by the model.`,
  ]
}

function normalizeProducts(result: ScanResult, fallback: ReturnType<typeof getRecommendedProducts>) {
  const recommendations = result.product_recommendations
  if (!recommendations) return fallback

  const convert = (product: ApiProductRecommendation): ProductRecommendation => ({
    ...product,
    skinTypes: product.skinTypes ?? product.skin_types ?? [],
    concernTags: product.concernTags ?? product.concern_tags ?? [],
    proDiscountCode: product.proDiscountCode ?? product.pro_discount_code,
  })

  return {
    sponsored: (recommendations.sponsored as ApiProductRecommendation[]).map(convert),
    organic: (recommendations.organic as ApiProductRecommendation[]).map(convert),
    all: (recommendations.all as ApiProductRecommendation[]).map(convert),
  }
}

function normalizeRemedies(result: ScanResult, fallback: HomeRemedy[]) {
  if (!result.home_remedies?.length) return fallback

  return (result.home_remedies as ApiHomeRemedy[]).map((remedy) => ({
    ...remedy,
    bestFor: remedy.bestFor ?? remedy.best_for ?? [],
  }))
}

export default function ResultsPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<StoredResultPayload | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('scanResult')
    setPayload(stored ? (JSON.parse(stored) as StoredResultPayload) : null)
  }, [])

  const preferences = useMemo(() => {
    if (!payload) return null
    return loadPreferences(payload.scan.user_id)
  }, [payload])

  useEffect(() => {
    if (!payload) {
      router.replace('/scan')
    }
  }, [payload, router])

  if (!payload || !preferences) {
    return (
      <div className="page-shell auth-shell">
        <div className="dashboard-layout">
          <main className="dashboard-main">
            <header className="page-header">
              <div>
                <div className="eyebrow">Latest analysis</div>
                <h1 className="display-title page-title">Result</h1>
              </div>
            </header>
            <p>Loading result...</p>
          </main>
        </div>
      </div>
    )
  }

  const { result, imageUrl, scan } = payload
  const acneLabel = ACNE_LABELS[result.acne_type ?? 'null']
  const severityColor = SEVERITY_COLORS[result.severity ?? 'null']
  const routineSections = parseRoutine(result.skincare_routine.routine)
  const insightLines = buildInsights(result)
  const fallbackProducts = getRecommendedProducts(scan, preferences.skinType, preferences.ingredientBlacklist)
  const products = normalizeProducts(result, fallbackProducts)
  const remedies = normalizeRemedies(result, getHomeRemedies(scan, preferences.skinType))
  const heroProducts: ProductRecommendation[] = products.all.slice(0, 4)

  return (
    <AppShell eyebrow="Latest analysis" title="Result">
      <section className="results-hero-grid">
        <article className="card card-section analysis-panel">
          <div className="analysis-kicker">
            <span className="section-label" style={{ marginBottom: 0 }}>AI analysis</span>
            <span className="mini-badge accent"><Bot size={12} /> {result.skincare_routine.provider}</span>
          </div>

          <div className="analysis-headline-row">
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.45rem' }}>
                {result.is_acne ? acneLabel : 'No active acne detected'}
              </h2>
              <p className="muted-copy">
                Structured model output, AI routine guidance, and supportive care suggestions in one place.
              </p>
            </div>

            <div className="pill-row">
              <span className="pill" style={{ borderColor: severityColor, color: severityColor }}>
                {result.severity ?? 'none'}
              </span>
              <span className="pill">{(result.confidence * 100).toFixed(1)}% confidence</span>
              <span className="pill">Skin type: {preferences.skinType}</span>
            </div>
          </div>

          <div className="analysis-summary-grid">
            {insightLines.map((line, index) => (
              <div key={`${line}-${index}`} className="analysis-summary-card">
                <Microscope size={16} />
                <p>{line}</p>
              </div>
            ))}
          </div>

          <div className="analysis-section-grid">
            {routineSections.map((section, sectionIndex) => (
              <section key={`${section.title}-${sectionIndex}`} className="analysis-routine-card">
                <div className="meta-label">{section.title}</div>
                <div className="stack" style={{ gap: '0.7rem', marginTop: '0.6rem' }}>
                  {section.items.map((item, index) => (
                    <div key={`${section.title}-${index}`} className="analysis-step-row">
                      <span className="analysis-step-index">{String(index + 1).padStart(2, '0')}</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="pill-row" style={{ marginTop: '1.2rem' }}>
            {result.recommendation_tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="pill">
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </article>

        <aside className="stack">
          <article className="card card-section snapshot-panel">
            <div className="section-label">Snapshot</div>
            <div className="scan-thumb result-thumb">{imageUrl ? <img src={imageUrl} alt="Latest upload" /> : null}</div>

            <div className="meta-grid">
              <div>
                <div className="meta-label">Acne type</div>
                <div className="meta-value">{result.is_acne ? acneLabel : 'None'}</div>
              </div>
              <div>
                <div className="meta-label">Severity</div>
                <div className="meta-value" style={{ color: severityColor }}>{result.severity ?? '-'}</div>
              </div>
              <div>
                <div className="meta-label">Confidence</div>
                <div className="meta-value">{(result.confidence * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="meta-label">Scan date</div>
                <div className="meta-value">{new Date(scan.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div className="quick-actions-row">
              <Link href="/scan" className="button-primary">Scan again</Link>
              <Link href="/progress" className="button-secondary">View progress</Link>
            </div>
          </article>

          <article className="disclaimer-banner">
            <strong>Medical disclaimer:</strong> DermaScan is not a medical diagnosis tool. If symptoms are severe, painful, or persistent, consult a dermatologist for formal evaluation.
          </article>
        </aside>
      </section>

      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">Recommended products</div>
            <h2 className="section-title">Suggested next-step skincare</h2>
          </div>
          <Link href="/products" className="button-secondary">
            Full catalog <ArrowRight size={15} />
          </Link>
        </div>

        <div className="results-subgrid">
          <div className="results-inline-panel">
            <div className="meta-label">Sponsored picks</div>
            <p className="muted-copy">Higher-visibility recommendations with possible Pro discount access.</p>
            <div className="results-count-row">
              <span>{products.sponsored.length} sponsored</span>
              <span>{products.organic.length} organic</span>
            </div>
          </div>

          <div className="results-inline-panel">
            <div className="meta-label">Why these products</div>
            <p className="muted-copy">
              These suggestions match the acne type, the model&apos;s recommendation tags, and your selected skin profile.
            </p>
          </div>
        </div>

        <ProductCards products={heroProducts} canUseDiscountCodes={preferences.plan === 'pro'} />
      </section>

      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">Home remedies</div>
            <h2 className="section-title">Supportive at-home care</h2>
          </div>
          <Link href="/remedies" className="button-secondary">
            Open remedies <ArrowRight size={15} />
          </Link>
        </div>

        {!result.is_acne ? (
          <div className="banner info" style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={16} style={{ display: 'inline-block', marginRight: '0.45rem' }} />
            Even without detected acne, keep a gentle cleanser, moisturizer, and sunscreen routine for prevention.
          </div>
        ) : null}

        <div className="results-subgrid">
          <div className="results-inline-panel">
            <div className="meta-label">Care notes</div>
            <p className="muted-copy">
              Remedies are filtered for <strong style={{ color: 'var(--text)' }}>{preferences.skinType}</strong> skin and should be used as supportive care, not as a replacement for prescribed treatment.
            </p>
          </div>

          <div className="results-inline-panel">
            <div className="meta-label">Latest scan</div>
            <div className="mini-lock-row" style={{ marginTop: '0.4rem' }}>
              <Calendar size={14} />
              <span>{new Date(scan.created_at).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <RemedyCards remedies={remedies} />
      </section>
    </AppShell>
  )
}
