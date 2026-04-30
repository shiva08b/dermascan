import { AlertTriangle } from 'lucide-react'

export function MedicalDisclaimer() {
  return (
    <div className="disclaimer-banner">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>⚠️ Medical Disclaimer</strong>
          <ul className="disclaimer-items">
            <li>• DermaScan is <strong>not a medical diagnosis tool</strong>. It provides AI-assisted analysis for informational purposes only.</li>
            <li>• For severe acne, painful lesions, infections, or sudden worsening, <strong>consult a qualified dermatologist</strong>.</li>
            <li>• Do not use this tool as a substitute for professional medical advice, diagnosis, or treatment.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
