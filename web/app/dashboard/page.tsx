'use client'
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { BarChart3, Camera, Clock, Leaf, Lock, ShoppingBag, Sparkles, Stethoscope, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ProgressChart } from '@/components/charts'
import { ProductCards } from '@/components/product-cards'
import { RemedyCards } from '@/components/remedy-cards'
import { usePatientData } from '@/components/use-patient-data'
import { getStreakDays, getTrialEndsAt, getScanImageUrl } from '@/lib/app-data'
import { getHomeRemedies, getRecommendedProducts } from '@/lib/experience'
import { ACNE_LABELS } from '@/lib/types'

export default function DashboardPage() {
  const { user, loading, scans, latestScan, preferences, assets, subscription, allowance } = usePatientData()

  if (loading || !user || !preferences || !subscription || !allowance) {
    return (
      <main className="page-shell auth-shell">
        <div className="stack" style={{ alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '220px' }} />
          <div className="skeleton skeleton-text" style={{ width: '160px' }} />
        </div>
      </main>
    )
  }

  const streak = getStreakDays(scans)
  const latestImage = latestScan ? getScanImageUrl(latestScan, assets) : ''
  const products = getRecommendedProducts(latestScan, preferences.skinType, preferences.ingredientBlacklist)
  const remedies = getHomeRemedies(latestScan, preferences.skinType)

  return (
    <AppShell
      eyebrow="Your skin — today"
      title="Dashboard"
      action={
        <Link href="/scan" className="button-primary no-print">
          <Camera size={15} />
          <span>New scan</span>
        </Link>
      }
    >
      {/* ── 📊 Stats Overview ─────────── */}
      <section className="stats-grid">
        <article className="card card-section">
          <div className="section-label">Total scans</div>
          <div className="metric-value">{scans.length}</div>
        </article>
        <article className="card card-section">
          <div className="section-label">Streak</div>
          <div className="metric-value">{streak}</div>
          <div className="metric-caption">consecutive days</div>
        </article>
        <article className="card card-section">
          <div className="section-label">Scans used / limit</div>
          <div className="metric-value">{allowance.unlimited ? allowance.used : `${allowance.used}/${10}`}</div>
          <div className="metric-caption">{allowance.unlimited ? 'Unlimited — Trial / Pro' : 'Free plan cap'}</div>
        </article>
        <article className="card card-section">
          <div className="section-label">Plan</div>
          <div className="metric-value">{subscription.tier === 'pro' ? 'Pro' : subscription.trialActive ? 'Trial' : 'Free'}</div>
          <div className="metric-caption">
            {subscription.trialActive ? `Ends ${getTrialEndsAt(preferences).toLocaleDateString('en-IN')}` : 'Upgrade for unlimited'}
          </div>
        </article>
      </section>

      {/* ── 📈 Scan Results & Progress ── */}
      <section className="feature-section" style={{ marginTop: 0 }}>
        <div className="section-icon-row">
          <TrendingUp size={16} color="var(--accent)" />
          <div className="section-label" style={{ marginBottom: 0 }}>Scan Results</div>
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="card card-section">
          <div className="section-label">Severity trajectory</div>
          <h2 className="section-title">Progress over time</h2>
          <ProgressChart scans={scans} />
        </article>

        <article className="card card-section">
          <div className="section-label">Latest scan</div>
          {latestScan ? (
            <>
              <div className="scan-thumb" style={{ marginBottom: '1rem' }}>
                {latestImage ? <img src={latestImage} alt="Latest scan" /> : null}
              </div>
              <div className="meta-grid">
                <div>
                  <div className="meta-label">Acne</div>
                  <div className="meta-value">{latestScan.is_acne ? ACNE_LABELS[latestScan.acne_type ?? 'null'] : 'None'}</div>
                </div>
                <div>
                  <div className="meta-label">Severity</div>
                  <div className="meta-value">{latestScan.severity ?? '-'}</div>
                </div>
                <div>
                  <div className="meta-label">Confidence</div>
                  <div className="meta-value">{(latestScan.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="meta-label">Date</div>
                  <div className="meta-value">{new Date(latestScan.created_at).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <Link href="/history" className="button-secondary" style={{ flex: 1 }}>
                  <Clock size={14} />
                  <span>History</span>
                </Link>
                <Link href="/progress" className="button-secondary" style={{ flex: 1 }}>
                  <BarChart3 size={14} />
                  <span>Progress</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">Your latest scan appears here after the first upload.</div>
          )}
        </article>
      </section>

      {/* ── 🛍️ Products ──────────────── */}
      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-icon-row">
              <ShoppingBag size={16} color="var(--accent)" />
              <div className="section-label" style={{ marginBottom: 0 }}>Products</div>
            </div>
            <h2 className="section-title">Recommended skincare picks</h2>
          </div>
          <Link href="/products" className="button-secondary">
            <ShoppingBag size={15} />
            <span>View all</span>
          </Link>
        </div>
        <ProductCards products={products.all.slice(0, 3)} canUseDiscountCodes={subscription.canUseDiscountCodes} />
      </section>

      {/* ── 🌿 Remedies ──────────────── */}
      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-icon-row">
              <Leaf size={16} color="var(--accent)" />
              <div className="section-label" style={{ marginBottom: 0 }}>Remedies</div>
            </div>
            <h2 className="section-title">At-home calming options</h2>
          </div>
          <Link href="/remedies" className="button-secondary">
            <span>Open remedies</span>
          </Link>
        </div>
        <RemedyCards remedies={remedies.slice(0, 2)} />
      </section>

      {/* ── 💳 Subscription & Dermatologist ── */}
      <section className="dashboard-grid" style={{ marginTop: '1.8rem' }}>
        <article className="card card-section">
          <div className="section-icon-row">
            <Sparkles size={16} color="var(--accent)" />
            <div className="section-label" style={{ marginBottom: 0 }}>Subscription</div>
          </div>
          <h2 className="section-title">{subscription.tier === 'pro' ? 'Unlimited access' : 'Freemium plan'}</h2>
          <p className="muted-copy" style={{ marginBottom: '1rem' }}>
            Free users get 10 scans per month. Every new account includes a 1-month free trial. Pro unlocks unlimited scans and exclusive product discount codes.
          </p>
          <div className="pill-row">
            <span className="pill">{allowance.unlimited ? '✦ Unlimited scanning' : `${allowance.remaining} scans remaining`}</span>
            <span className="pill">
              {subscription.canUseDiscountCodes ? '✦ Discount codes unlocked' : (
                <><Lock size={12} /> Discount codes locked</>
              )}
            </span>
          </div>
        </article>

        <article className="card card-section">
          <div className="section-icon-row">
            <Stethoscope size={16} color="var(--accent)" />
            <div className="section-label" style={{ marginBottom: 0 }}>Advanced care</div>
          </div>
          <h2 className="section-title">Consult a dermatologist</h2>
          <p className="muted-copy" style={{ marginBottom: '1rem' }}>
            For advanced treatment, share your patient ID with a dermatologist to review scan history, progress analytics, and prescriptions.
          </p>
          <div className="pill-row" style={{ marginBottom: '1rem' }}>
            <span className="pill">Patient ID: {preferences.patientCode}</span>
            {!subscription.canUseDiscountCodes ? (
              <span className="pill"><Lock size={12} /> Pro discount perks locked</span>
            ) : null}
          </div>
          <Link href="/dermatologists" className="button-secondary">
            <Stethoscope size={15} />
            <span>Find nearby dermatologists</span>
          </Link>
        </article>
      </section>
    </AppShell>
  )
}
