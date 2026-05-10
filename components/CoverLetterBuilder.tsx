'use client'
import { useState } from 'react'
import type { EuropassCV, CoverLetter, CoverLetterRequest } from '@/types/europass'

interface CoverLetterBuilderProps {
  cv: EuropassCV
  printRef?: React.RefObject<HTMLDivElement | null>
}

export default function CoverLetterBuilder({ cv, printRef }: CoverLetterBuilderProps) {
  const [req, setReq] = useState<CoverLetterRequest>({ jobTitle: '', company: '', jobDescription: '', country: '' })
  const [letter, setLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!req.jobTitle || !req.company) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, ...req }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLetter(data.letter)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  const p = cv.personalInfo

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' }}>
      {/* Controls */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, position: 'sticky', top: 88 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          ✉ Cover Letter Settings
        </div>

        {[
          ['jobTitle', 'Job Title *', 'e.g. Data Analyst'],
          ['company', 'Company *', 'e.g. Accenture'],
          ['country', 'Country', 'e.g. Germany'],
        ].map(([key, label, placeholder]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</label>
            <input
              value={(req as unknown as Record<string, string>)[key] ?? ''}
              onChange={(e) => setReq((r) => ({ ...r, [key]: e.target.value }))}
              placeholder={placeholder}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Job Description (optional but recommended)
          </label>
          <textarea
            value={req.jobDescription ?? ''}
            onChange={(e) => setReq((r) => ({ ...r, jobDescription: e.target.value }))}
            placeholder="Paste the job posting here for a more tailored letter..."
            rows={5}
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={generate}
          disabled={!req.jobTitle || !req.company || loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--accent)', color: 'white',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
          }}
        >
          {loading ? '⟳ Writing letter...' : '✦ Generate Cover Letter'}
        </button>

        {letter && (
          <button
            onClick={() => {
              const el = printRef?.current
              if (!el) return window.print()
              const w = window.open('', '_blank')
              if (!w) return
              w.document.write(`<html><head><title>Cover Letter</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;line-height:1.6;color:#1a1a2e;font-size:13px}</style></head><body>${el.innerHTML}</body></html>`)
              w.document.close()
              w.print()
            }}
            style={{
              width: '100%', marginTop: 8, padding: '10px',
              borderRadius: 10, background: 'var(--bg3)',
              color: 'var(--text-2)', border: '1px solid var(--border)', fontSize: 13,
            }}
          >
            ↓ Print / Save as PDF
          </button>
        )}
      </div>

      {/* Letter preview */}
      <div>
        {!letter && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-3)', border: '2px dashed var(--border)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉</div>
            <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8 }}>No cover letter yet</div>
            <div style={{ fontSize: 13 }}>Fill in the job details and click Generate</div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: 'var(--text-2)' }}>Writing your tailored cover letter...</div>
          </div>
        )}

        {letter && (
          <div
            ref={printRef as React.RefObject<HTMLDivElement>}
            style={{
              background: 'white', color: '#1a1a2e',
              fontFamily: '"DM Sans", Arial, sans-serif',
              fontSize: 12, lineHeight: 1.7,
              maxWidth: 794, margin: '0 auto',
              padding: '56px 64px',
              boxShadow: '0 4px 48px rgba(0,0,0,0.4)',
              borderRadius: 4,
            }}
          >
            {/* Sender info */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: '"Syne", sans-serif', fontSize: 18, fontWeight: 800, color: '#003399', marginBottom: 4 }}>
                {p.firstName} {p.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.8 }}>
                {[p.address, p.city, p.country].filter(Boolean).join(' · ')}<br />
                {p.email && <>{p.email} · </>}{p.phone}
                {p.linkedin && <><br />linkedin: {p.linkedin}</>}
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: 24, fontSize: 11, color: '#6b7280' }}>{letter.date}</div>

            {/* Subject */}
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 20, color: '#1f2937' }}>{letter.subject}</div>

            {/* Salutation */}
            <p style={{ marginBottom: 16 }}>{letter.salutation}</p>

            {/* Opening */}
            <p style={{ marginBottom: 16 }}>{letter.opening}</p>

            {/* Body paragraphs */}
            {letter.body?.map((para, i) => (
              <p key={i} style={{ marginBottom: 16 }}>{para}</p>
            ))}

            {/* Closing */}
            <p style={{ marginBottom: 32 }}>{letter.closing}</p>

            {/* Signoff */}
            <p style={{ marginBottom: 48 }}>{letter.signoff}</p>
            <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>

            {/* EU bar */}
            <div style={{ marginTop: 40, paddingTop: 12, borderTop: '1px solid #e5e7eb', fontSize: 9, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
              <span>Europass Cover Letter · europa.eu/europass</span>
              <span>Generated by PradipBuild</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
