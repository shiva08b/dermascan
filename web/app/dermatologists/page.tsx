'use client'

import { useMemo, useState } from 'react'
import { LocateFixed, Stethoscope } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { getNearbyDermatologists } from '@/lib/experience'

export default function DermatologistsPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [status, setStatus] = useState('Use your location to sort nearby dermatologists.')
  const doctors = useMemo(
    () => getNearbyDermatologists(location?.latitude, location?.longitude),
    [location],
  )

  function handleLocate() {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not available in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setStatus('Nearest dermatologists sorted by your current location.')
      },
      () => setStatus('Could not fetch your location. Showing dermatologist directory instead.'),
    )
  }

  return (
    <AppShell eyebrow="Specialist support" title="Dermatologists">
      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">Advanced treatment</div>
            <h2 className="section-title">For advanced treatment, consult a dermatologist</h2>
          </div>
          <button type="button" className="button-primary" onClick={handleLocate}>
            <LocateFixed size={15} />
            <span>Use my location</span>
          </button>
        </div>

        <div className="banner info" style={{ marginBottom: '1rem' }}>{status}</div>

        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="card card-section">
              <div className="section-label">{doctor.city}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{doctor.name}</h3>
              <div className="muted-copy" style={{ marginBottom: '0.7rem' }}>{doctor.clinic}</div>
              <div className="stack" style={{ gap: '0.5rem' }}>
                <div><strong>Specialty:</strong> {doctor.specialty}</div>
                <div><strong>Distance:</strong> {doctor.distanceKm ? `${doctor.distanceKm.toFixed(1)} km` : 'Location required'}</div>
                <div><strong>Contact:</strong> {doctor.phone}</div>
                <div><strong>Email:</strong> {doctor.email}</div>
              </div>
              <div className="mini-lock-row accent" style={{ marginTop: '1rem' }}>
                <Stethoscope size={14} />
                <span>Share your patient ID with your dermatologist for progress review.</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
