'use client'
import type { EuropassCV } from '@/types/europass'
import CEFRGrid from './CEFRGrid'

interface EuropassPreviewProps {
  cv: EuropassCV
  printRef?: React.RefObject<HTMLDivElement | null>
}

const S = {
  doc: {
    background: 'white',
    color: '#1a1a2e',
    fontFamily: '"DM Sans", Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.5,
    maxWidth: 794,
    margin: '0 auto',
    padding: '40px 48px',
    boxShadow: '0 4px 48px rgba(0,0,0,0.4)',
    borderRadius: 4,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
    borderBottom: '3px solid #003399',
    paddingBottom: 20,
    marginBottom: 20,
  } as React.CSSProperties,
  photo: {
    width: 90,
    height: 110,
    background: '#e5e7eb',
    borderRadius: 4,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: 11,
    overflow: 'hidden',
  } as React.CSSProperties,
  name: {
    fontFamily: '"Syne", sans-serif',
    fontSize: 26,
    fontWeight: 800,
    color: '#003399',
    letterSpacing: '-0.02em',
    marginBottom: 2,
  } as React.CSSProperties,
  section: {
    marginBottom: 20,
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: '"Syne", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    color: 'white',
    background: '#003399',
    padding: '4px 10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottom: '1px solid #f3f4f6',
  } as React.CSSProperties,
  dateCol: {
    color: '#6b7280',
    fontSize: 10,
    paddingTop: 2,
  } as React.CSSProperties,
  jobTitle: {
    fontWeight: 600,
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 2,
  } as React.CSSProperties,
  employer: {
    color: '#003399',
    fontSize: 11,
    marginBottom: 4,
  } as React.CSSProperties,
  bullet: {
    display: 'flex',
    gap: 6,
    marginBottom: 2,
    fontSize: 10.5,
    color: '#374151',
  } as React.CSSProperties,
  contactRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
    fontSize: 10.5,
    color: '#4b5563',
    marginTop: 6,
  } as React.CSSProperties,
  euFlag: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  } as React.CSSProperties,
  skillChip: {
    background: '#eff6ff',
    color: '#1e40af',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 500,
    display: 'inline-block',
    margin: '2px 3px 2px 0',
  } as React.CSSProperties,
}

function Flag() {
  return (
    <svg width="32" height="22" viewBox="0 0 32 22" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="22" fill="#003399" />
      {[...Array(12)].map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180)
        const cx = 16 + 7 * Math.cos(a)
        const cy = 11 + 7 * Math.sin(a)
        return (
          <polygon
            key={i}
            points={`${cx},${cy - 2} ${cx + 0.8},${cy - 0.7} ${cx + 1.4},${cy + 1.7} ${cx},${cy + 0.9} ${cx - 1.4},${cy + 1.7} ${cx - 0.8},${cy - 0.7}`}
            fill="#FFCC00"
          />
        )
      })}
    </svg>
  )
}

export default function EuropassPreview({ cv, printRef }: EuropassPreviewProps) {
  const p = cv.personalInfo

  return (
    <div ref={printRef as React.RefObject<HTMLDivElement>} className="europass-doc" style={S.doc}>

      {/* EU Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={S.euFlag}>
          <Flag />
          <span style={{ fontSize: 9, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Europass<br />Curriculum Vitae
          </span>
        </div>
        <div style={{ fontSize: 9, color: '#9ca3af' }}>
          {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Personal Info Header */}
      <div style={S.header}>
        <div style={S.photo}>
          {p.photo ? (
            <img src={p.photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>Photo</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.name}>
            {p.firstName} {p.lastName}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
            {p.nationality && `${p.nationality} · `}
            {p.dateOfBirth && `Born ${p.dateOfBirth}`}
          </div>
          <div style={S.contactRow}>
            {p.address && <span>📍 {p.address}, {p.city}, {p.country}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.email && <span>✉ {p.email}</span>}
            {p.linkedin && <span>in {p.linkedin}</span>}
            {p.website && <span>🌐 {p.website}</span>}
          </div>
        </div>
      </div>

      {/* Personal Statement */}
      {cv.personalStatement && (
        <div data-pdf-section style={{ ...S.section, background: '#f0f4ff', padding: '12px 14px', borderRadius: 4, borderLeft: '3px solid #003399' }}>
          <p style={{ fontSize: 11, color: '#1e3a5f', lineHeight: 1.6, fontStyle: 'italic' }}>
            {cv.personalStatement}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {cv.workExperience?.length > 0 && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}>
            <span>💼</span> Work Experience
          </div>
          {cv.workExperience.map((w) => (
            <div key={w.id} data-pdf-section style={S.row}>
              <div style={S.dateCol}>
                <div style={{ fontWeight: 600 }}>{w.startDate} – {w.current ? 'Present' : w.endDate}</div>
                <div>{w.city}, {w.country}</div>
              </div>
              <div>
                <div style={S.jobTitle}>{w.jobTitle}</div>
                <div style={S.employer}>{w.employer}</div>
                {w.description && <p style={{ fontSize: 10.5, color: '#4b5563', marginBottom: 6 }}>{w.description}</p>}
                {w.activities?.map((a, i) => (
                  <div key={i} style={S.bullet}>
                    <span style={{ color: '#003399', flexShrink: 0 }}>▸</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {cv.education?.length > 0 && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>🎓</span> Education and Training</div>
          {cv.education.map((e) => (
            <div key={e.id} data-pdf-section style={S.row}>
              <div style={S.dateCol}>
                <div style={{ fontWeight: 600 }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</div>
                <div>{e.city}, {e.country}</div>
                {e.eqfLevel && <div style={{ marginTop: 4, background: '#eff6ff', color: '#1e40af', padding: '1px 6px', borderRadius: 3, fontSize: 9, display: 'inline-block' }}>EQF {e.eqfLevel}</div>}
              </div>
              <div>
                <div style={S.jobTitle}>{e.title}</div>
                <div style={S.employer}>{e.institution}</div>
                {e.field && <div style={{ fontSize: 10, color: '#6b7280' }}>Field: {e.field}</div>}
                {e.description && <p style={{ fontSize: 10.5, color: '#4b5563', marginTop: 4 }}>{e.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {cv.languages?.length > 0 && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>🌐</span> Language Skills</div>
          {cv.languages.map((lang) => (
            <div key={lang.language} data-pdf-section style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{lang.language}</div>
              <CEFRGrid
                listening={lang.listening}
                reading={lang.reading}
                spokenProduction={lang.spokenProduction}
                spokenInteraction={lang.spokenInteraction}
                writing={lang.writing}
                native={lang.native}
              />
              {lang.certificate && (
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Certificate: {lang.certificate}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Digital Skills */}
      {cv.digitalSkills?.length > 0 && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>💻</span> Digital Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            {cv.digitalSkills.map((d, i) => (
              <div key={i} style={{ marginBottom: 8, marginRight: 24, minWidth: 180 }}>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{d.area}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{d.level}</div>
                {d.description && <div style={{ fontSize: 10, color: '#4b5563' }}>{d.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Skills */}
      {cv.otherSkills?.length > 0 && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>✦</span> Other Skills</div>
          {cv.otherSkills.map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {s.category && <span style={{ fontWeight: 600, fontSize: 11, marginRight: 8 }}>{s.category}:</span>}
              <span style={{ fontSize: 11, color: '#374151' }}>{s.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Driving */}
      {cv.drivingLicense?.length ? (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>🚗</span> Driving Licence</div>
          <div>Category {cv.drivingLicense.join(', ')}</div>
        </div>
      ) : null}

      {/* Additional Info */}
      {cv.additionalInfo && (
        <div data-pdf-section style={S.section}>
          <div style={S.sectionTitle}><span>ℹ</span> Additional Information</div>
          <p style={{ fontSize: 11 }}>{cv.additionalInfo}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 20, fontSize: 9, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>© European Union, 2002-{new Date().getFullYear()} · europass.eu</span>
        <span>Generated by PradipBuild</span>
      </div>
    </div>
  )
}