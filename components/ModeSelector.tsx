'use client'
import { useState } from 'react'
import type { GenerationMode, IntelligenceReport } from '@/types/europass'

interface ModeSelectorProps {
  report: IntelligenceReport
  onSelect: (mode: GenerationMode, jobDetails?: { jobTitle: string; company: string; jobDescription?: string; country?: string; recipientName?: string }) => void
  loading: boolean
}

const MODES: {
  key: GenerationMode
  icon: string
  title: string
  subtitle: string
  desc: string
  color: string
  needsJobInfo: boolean
}[] = [
  {
    key: 'europass',
    icon: '🇪🇺',
    title: 'Europass CV',
    subtitle: 'Official EU format',
    desc: 'Generates a fully compliant Europass CV with CEFR language grid, EQF education levels, and all EU-standard sections. Export as PDF.',
    color: '#003399',
    needsJobInfo: false,
  },
  {
    key: 'cover_letter',
    icon: '✉️',
    title: 'Europass Cover Letter',
    subtitle: 'Targeted application letter',
    desc: 'Writes a professional, personalised cover letter referencing your actual achievements and tailored to a specific role and company.',
    color: '#6c63ff',
    needsJobInfo: true,
  },
  {
    key: 'cv_summary',
    icon: '📊',
    title: 'Career Analysis',
    subtitle: 'AI-powered profile report',
    desc: "Deep analysis of your career trajectory, top strengths, key achievements, skill gaps, and recommended roles. Great for self-reflection.",
    color: '#22d3a0',
    needsJobInfo: false,
  },
]

export default function ModeSelector({ report, onSelect, loading }: ModeSelectorProps) {
  const [selected, setSelected] = useState<GenerationMode>(report?.recommendedMode ?? 'europass')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [country, setCountry] = useState('')
  const [recipientName, setRecipientName] = useState('')

  if (!report) return null

  const selectedMode = MODES.find((m) => m.key === selected)!

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(34,211,160,0.12)',
          border: '1px solid rgba(34,211,160,0.3)',
          color: 'var(--green)',
          padding: '4px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 12,
        }}>
          ✓ Documents analysed — {report.overallConfidence}% confidence
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: 8,
        }}>
          What would you like to generate?
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Based on your documents, we detected: {report.detectedRoles?.slice(0, 2).join(', ') || 'a professional profile'}
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {MODES.map((mode) => {
          const isRecommended = mode.key === report.recommendedMode
          const isSelected = selected === mode.key
          return (
            <button
              key={mode.key}
              onClick={() => setSelected(mode.key)}
              style={{
                textAlign: 'left',
                padding: '18px 20px',
                borderRadius: 12,
                background: isSelected ? `${mode.color}15` : 'var(--bg3)',
                border: `2px solid ${isSelected ? mode.color : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {isRecommended && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--green)', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                }}>RECOMMENDED</span>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{mode.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{mode.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{mode.subtitle}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{mode.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Job details form for cover letter */}
      {selectedMode.needsJobInfo && (
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            ✉️ Job Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Job Title *
              </label>
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Data Analyst" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Company *
              </label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Siemens AG" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Country
              </label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Germany" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recipient Name
              </label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Dr. Müller (optional)" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Job Description (paste for best results)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — AI will tailor the letter to match..."
              rows={5}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (selectedMode.needsJobInfo) {
            onSelect(selected, { jobTitle, company, jobDescription, country, recipientName })
          } else {
            onSelect(selected)
          }
        }}
        disabled={loading || (selectedMode.needsJobInfo && (!jobTitle || !company))}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 12,
          background: selectedMode.color,
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: '0.01em',
          boxShadow: `0 0 32px ${selectedMode.color}44`,
          opacity: loading || (selectedMode.needsJobInfo && (!jobTitle || !company)) ? 0.5 : 1,
        }}
      >
        {loading ? '⟳ Generating...' : `✦ Generate ${selectedMode.title}`}
      </button>

      {selectedMode.needsJobInfo && (!jobTitle || !company) && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
          Job title and company name are required
        </p>
      )}
    </div>
  )
}