'use client'
import type { IntelligenceReport, DocumentAnalysis, DocumentCategory } from '@/types/europass'

const CATEGORY_CONFIG: Record<DocumentCategory, { icon: string; label: string; color: string }> = {
  cv_resume:         { icon: '📄', label: 'CV / Resume',           color: '#6c63ff' },
  cover_letter:      { icon: '✉️',  label: 'Cover Letter',          color: '#3b82f6' },
  passport_id:       { icon: '🪪',  label: 'Passport / ID',         color: '#f59e0b' },
  degree_transcript: { icon: '🎓', label: 'Degree / Transcript',   color: '#22d3a0' },
  work_certificate:  { icon: '🏢', label: 'Work Certificate',       color: '#a78bfa' },
  reference_letter:  { icon: '⭐', label: 'Reference Letter',       color: '#f472b6' },
  linkedin_export:   { icon: '💼', label: 'LinkedIn Export',        color: '#0ea5e9' },
  portfolio:         { icon: '🗂️', label: 'Portfolio',              color: '#84cc16' },
  other:             { icon: '📁', label: 'Other',                  color: '#6b7280' },
}

interface IntelligenceCardProps {
  doc: DocumentAnalysis
}

function IntelligenceCard({ doc }: IntelligenceCardProps) {
  const cfg = CATEGORY_CONFIG[doc.category] ?? CATEGORY_CONFIG.other
  return (
    <div style={{
      background: 'var(--bg3)',
      border: `1px solid ${cfg.color}33`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: `${cfg.color}22`, color: cfg.color,
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
            }}>{cfg.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{doc.confidence}% confidence</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{doc.filename}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.5 }}>{doc.summary}</p>
      {doc.keyFindings?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {doc.keyFindings.slice(0, 3).map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface IntelligencePanelProps {
  report: IntelligenceReport
}

export default function IntelligencePanel({ report }: IntelligencePanelProps) {
  return (
    <div>
      {/* Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(34,211,160,0.08) 100%)',
        border: '1px solid rgba(108,99,255,0.25)',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 20,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          🔍 Document Intelligence Report
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
          {report.combinedInsights}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {report.detectedRoles?.slice(0, 3).map((r) => (
            <span key={r} style={{
              background: 'rgba(108,99,255,0.15)', color: 'var(--accent-2)',
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
            }}>{r}</span>
          ))}
          {report.detectedLanguages?.map((l) => (
            <span key={l} style={{
              background: 'rgba(34,211,160,0.12)', color: 'var(--green)',
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Skills cloud */}
      {report.detectedSkills?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Detected Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {report.detectedSkills.slice(0, 20).map((s) => (
              <span key={s} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text-2)', fontSize: 11, padding: '3px 9px', borderRadius: 6,
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Per-document cards */}
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Files Analysed ({report.documents?.length ?? 0})
      </div>
      {report.documents?.map((doc) => (
        <IntelligenceCard key={doc.filename} doc={doc} />
      ))}
    </div>
  )
}
