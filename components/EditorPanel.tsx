'use client'
import { useState } from 'react'
import type { EuropassCV, WorkExperience, Education } from '@/types/europass'

interface EditorPanelProps {
  cv: EuropassCV
  onChange: (cv: EuropassCV) => void
}

type EditorSection = 'personal' | 'statement' | 'work' | 'education' | 'languages' | 'skills'

const TAB_LABELS: { key: EditorSection; label: string; icon: string }[] = [
  { key: 'personal', label: 'Personal', icon: '👤' },
  { key: 'statement', label: 'Summary', icon: '✍' },
  { key: 'work', label: 'Experience', icon: '💼' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'languages', label: 'Languages', icon: '🌐' },
  { key: 'skills', label: 'Skills', icon: '✦' },
]

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 12,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-2)',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

export default function EditorPanel({ cv, onChange }: EditorPanelProps) {
  const [tab, setTab] = useState<EditorSection>('personal')

  const setPersonal = (key: string, val: string) =>
    onChange({ ...cv, personalInfo: { ...cv.personalInfo, [key]: val } })

  const setWork = (id: string, key: keyof WorkExperience, val: string | boolean | string[]) => {
    onChange({
      ...cv,
      workExperience: cv.workExperience.map((w) => (w.id === id ? { ...w, [key]: val } : w)),
    })
  }

  const setEdu = (id: string, key: keyof Education, val: string | boolean) => {
    onChange({
      ...cv,
      education: cv.education.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    })
  }

  const p = cv.personalInfo

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, flexWrap: 'wrap' }}>
        {TAB_LABELS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: tab === t.key ? 'var(--accent)' : 'var(--bg3)',
              color: tab === t.key ? 'white' : 'var(--text-2)',
              border: `1px solid ${tab === t.key ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Personal Info */}
        {tab === 'personal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['firstName', 'First Name'], ['lastName', 'Last Name'],
              ['email', 'Email'], ['phone', 'Phone'],
              ['dateOfBirth', 'Date of Birth (DD/MM/YYYY)'], ['nationality', 'Nationality'],
              ['address', 'Address'], ['city', 'City'],
              ['country', 'Country'], ['gender', 'Gender'],
              ['linkedin', 'LinkedIn URL'], ['website', 'Website'],
            ].map(([key, label]) => (
              <div key={key} style={{ ...fieldStyle, gridColumn: ['address', 'linkedin', 'website'].includes(key) ? 'span 2' : 'span 1', paddingRight: 8 }}>
                <label style={labelStyle}>{label}</label>
                <input
                  value={(p as unknown as Record<string, string>)[key] ?? ''}
                  onChange={(e) => setPersonal(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Personal Statement */}
        {tab === 'statement' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Professional Summary</label>
            <textarea
              value={cv.personalStatement || ''}
              onChange={(e) => onChange({ ...cv, personalStatement: e.target.value })}
              rows={6}
              style={{ resize: 'vertical' }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
              2–4 sentences. First person. Focus on your value proposition and career goals.
            </p>
          </div>
        )}

        {/* Work Experience */}
        {tab === 'work' && (
          <div>
            {cv.workExperience?.map((w, idx) => (
              <div key={w.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Experience {idx + 1}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={w.current} onChange={(e) => setWork(w.id, 'current', e.target.checked)} />
                    Current role
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['jobTitle', 'Job Title'], ['employer', 'Employer'], ['city', 'City'], ['country', 'Country'], ['startDate', 'Start (MM/YYYY)'], ['endDate', 'End (MM/YYYY)']].map(([k, l]) => (
                    <div key={k} style={fieldStyle}>
                      <label style={labelStyle}>{l}</label>
                      <input value={(w as unknown as Record<string, string>)[k] ?? ''} onChange={(e) => setWork(w.id, k as keyof WorkExperience, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Role Description</label>
                  <textarea value={w.description || ''} onChange={(e) => setWork(w.id, 'description', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Key Activities / Achievements (one per line)</label>
                  <textarea
                    value={(w.activities || []).join('\n')}
                    onChange={(e) => setWork(w.id, 'activities', e.target.value.split('\n'))}
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {tab === 'education' && (
          <div>
            {cv.education?.map((e, idx) => (
              <div key={e.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Education {idx + 1}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={e.current} onChange={(ev) => setEdu(e.id, 'current', ev.target.checked)} />
                    In progress
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['title', 'Degree / Certificate'], ['institution', 'Institution'], ['field', 'Field of Study'], ['eqfLevel', 'EQF Level (1-8)'], ['city', 'City'], ['country', 'Country'], ['startDate', 'Start (MM/YYYY)'], ['endDate', 'End (MM/YYYY)']].map(([k, l]) => (
                    <div key={k} style={fieldStyle}>
                      <label style={labelStyle}>{l}</label>
                      <input value={(e as unknown as Record<string, string>)[k] ?? ''} onChange={(ev) => setEdu(e.id, k as keyof Education, ev.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {tab === 'languages' && (
          <div>
            {cv.languages?.map((lang, i) => (
              <div key={lang.language + i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{lang.language}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {['listening', 'reading', 'spokenProduction', 'spokenInteraction', 'writing'].map((sk) => (
                    <div key={sk} style={fieldStyle}>
                      <label style={labelStyle}>{sk.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <select
                        value={(lang as unknown as Record<string, string>)[sk]}
                        onChange={(e) => {
                          const updated = [...cv.languages]
                          updated[i] = { ...lang, [sk]: e.target.value }
                          onChange({ ...cv, languages: updated })
                        }}
                      >
                        {['A1','A2','B1','B2','C1','C2','Native'].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {tab === 'skills' && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Digital Skills</div>
            {cv.digitalSkills?.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={d.area} onChange={(e) => {
                  const s = [...cv.digitalSkills]; s[i] = { ...d, area: e.target.value }
                  onChange({ ...cv, digitalSkills: s })
                }} placeholder="e.g. Microsoft Office, Python" />
                <select value={d.level} onChange={(e) => {
                  const s = [...cv.digitalSkills]; s[i] = { ...d, level: e.target.value as 'Basic' | 'Intermediate' | 'Advanced' }
                  onChange({ ...cv, digitalSkills: s })
                }}>
                  {['Basic','Intermediate','Advanced'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            ))}
            <div style={{ fontWeight: 600, fontSize: 13, margin: '20px 0 10px' }}>Other Skills</div>
            {cv.otherSkills?.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <input value={s.description} onChange={(e) => {
                  const sk = [...cv.otherSkills]; sk[i] = { ...s, description: e.target.value }
                  onChange({ ...cv, otherSkills: sk })
                }} placeholder="e.g. Project management, Public speaking" />
              </div>
            ))}
            <div style={{ fontWeight: 600, fontSize: 13, margin: '20px 0 10px' }}>Additional Information</div>
            <textarea
              value={cv.additionalInfo || ''}
              onChange={(e) => onChange({ ...cv, additionalInfo: e.target.value })}
              rows={3}
              placeholder="Memberships, publications, references available on request..."
            />
          </div>
        )}
      </div>
    </div>
  )
}
