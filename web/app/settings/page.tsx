'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useAuthUser } from '@/components/use-auth-user'
import {
  DEFAULT_PREFERENCES,
  getSubscriptionStatus,
  loadPreferences,
  savePreferences,
  type AppLanguage,
  type AppPreferences,
} from '@/lib/app-data'
import type { SkinType } from '@/lib/types'

const LANGUAGES: AppLanguage[] = [
  'English',
  'Espanol',
  'Francais',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Punjabi',
]

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'sensitive', 'combination']

export default function SettingsPage() {
  const { user, loading } = useAuthUser()
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES)
  const [draftIngredient, setDraftIngredient] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    queueMicrotask(() => {
      setPreferences(loadPreferences(user.id))
    })
  }, [user])

  const ingredientList = useMemo(() => preferences.ingredientBlacklist, [preferences])

  if (loading || !user) {
    return <main className="page-shell auth-shell">Loading settings...</main>
  }

  const userId = user.id
  const subscription = getSubscriptionStatus(preferences)

  function persist(next: AppPreferences) {
    setPreferences(next)
    savePreferences(userId, next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <AppShell eyebrow="Your account" title="Settings">
      <section className="stack">
        <article className="card card-section">
          <div className="section-label">Subscription</div>
          <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
            {preferences.plan === 'pro' ? 'Pro' : subscription.trialActive ? 'Free Trial' : 'Free'}
            <span style={{ color: 'var(--accent)' }}> - {preferences.plan === 'pro' ? 'Active' : subscription.trialActive ? 'Month 1' : 'Limited'}</span>
          </h2>
          <p className="muted-copy">Free plan gets 10 scans per month. Pro unlocks unlimited scans and exclusive discount codes.</p>
          <div className="pill-row" style={{ marginTop: '1rem' }}>
            <span className="pill">Patient ID: {preferences.patientCode}</span>
            <span className="pill">{preferences.plan === 'pro' ? 'Discount codes unlocked' : 'Discount codes locked'}</span>
          </div>
        </article>

        <article className="card card-section">
          <div className="section-label">Preferences</div>
          <h2 className="section-title">Language - reminders</h2>

          <div className="two-col">
            <label className="field-stack">
              <span className="field-label">Default routine language</span>
              <select
                className="text-select"
                value={preferences.language}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    language: event.target.value as AppLanguage,
                  })
                }
              >
                {LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-stack">
              <span className="field-label">Reminder hour (0-23)</span>
              <input
                className="text-input"
                type="number"
                min={0}
                max={23}
                value={preferences.reminderHour}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    reminderHour: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>

          <div className="two-col">
            <label className="field-stack">
              <span className="field-label">Skin type</span>
              <select
                className="text-select"
                value={preferences.skinType}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    skinType: event.target.value as SkinType,
                  })
                }
              >
                {SKIN_TYPES.map((skinType) => (
                  <option key={skinType} value={skinType}>
                    {skinType}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-stack">
              <span className="field-label">Plan</span>
              <select
                className="text-select"
                value={preferences.plan}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    plan: event.target.value as 'free' | 'pro',
                  })
                }
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'inline-flex', gap: '0.65rem', margin: '1rem 0 1.2rem' }}>
            <input
              type="checkbox"
              checked={preferences.remindersEnabled}
              onChange={(event) =>
                setPreferences({
                  ...preferences,
                  remindersEnabled: event.target.checked,
                })
              }
            />
            <span>Enable daily routine reminder</span>
          </label>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button type="button" className="button-primary" onClick={() => persist(preferences)}>
              Save preferences
            </button>
            {saved ? <span className="muted-copy">Saved.</span> : null}
          </div>
        </article>

        <article className="card card-section">
          <div className="section-label">Ingredient blacklist</div>
          <h2 className="section-title">Ingredients your skin refuses</h2>
          <p className="muted-copy" style={{ marginBottom: '1rem' }}>
            We&apos;ll flag these whenever you review products against your routine.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.6rem', marginBottom: '1rem' }}>
            <input
              className="text-input"
              placeholder="e.g., Fragrance, Alcohol Denat..."
              value={draftIngredient}
              onChange={(event) => setDraftIngredient(event.target.value)}
            />
            <button
              type="button"
              className="button-primary"
              onClick={() => {
                const next = draftIngredient.trim()
                if (!next || ingredientList.includes(next)) return

                const updated = {
                  ...preferences,
                  ingredientBlacklist: [...ingredientList, next],
                }

                persist(updated)
                setDraftIngredient('')
              }}
            >
              Add
            </button>
          </div>

          <div className="pill-row">
            {ingredientList.map((ingredient) => (
              <span key={ingredient} className="pill">
                {ingredient}
                <button
                  type="button"
                  onClick={() =>
                    persist({
                      ...preferences,
                      ingredientBlacklist: ingredientList.filter((item) => item !== ingredient),
                    })
                  }
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  )
}
