'use client'
import { useState } from 'react'
import type { EuropassCV, WorkExperience, Education } from '@/types/europass'
import PhotoUpload from './PhotoUpload'
import CompletenessBar from './CompletenessBar'

interface EditorPanelProps {
  cv: EuropassCV
  onChange: (cv: EuropassCV) => void
  combinedText?: string
  activeTab?: string
  onTabChange?: (tab: string) => void
}

type EditorSection = 'personal' | 'statement' | 'work' | 'education' | 'languages' | 'skills'

const TABS: { key: EditorSection; label: string; icon: string }[] = [
  { key: 'personal',   label: 'Personal',    icon: '👤' },
  { key: 'statement',  label: 'Summary',     icon: '✍' },
  { key: 'work',       label: 'Experience',  icon: '💼' },
  { key: 'education',  label: 'Education',   icon: '🎓' },
  { key: 'languages',  label: 'Languages',   icon: '🌐' },
  { key: 'skills',     label: 'Skills',      icon: '✦' },
]

const fld: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }
const lbl: React.CSSProperties = { fontSize: 11, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }

function AIRegenerateBtn({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 6, fontSize: 11,
        background: 'rgba(108,99,255,0.12)', color: 'var(--accent-2)',
        border: '1px solid rgba(108,99,255,0.25)', cursor: 'pointer',
        opacity: loading ? 0.5 : 1, fontWeight: 500,
      }}
    >
      <span>{loading ? '⟳' : '✦'}</span> {loading ? 'Generating...' : label}
    </button>
  )
}

export default function EditorPanel({ cv, onChange, combinedText, activeTab, onTabChange }: EditorPanelProps) {
  const [tab, setTab] = useState<EditorSection>((activeTab as EditorSection) ?? 'personal')
  const [regenLoading, setRegenLoading] = useState<Record<string, boolean>>({})

  const setTabAndNotify = (t: EditorSection) => {
    setTab(t)
    onTabChange?.(t)
  }

  // Sync external tab control
  if (activeTab && activeTab !== tab) setTab(activeTab as EditorSection)

  const setPersonal = (key: string, val: string) =>
    onChange({ ...cv, personalInfo: { ...cv.personalInfo, [key]: val } })

  const setWork = (id: string, key: keyof WorkExperience, val: string | boolean | string[]) =>
    onChange({ ...cv, workExperience: cv.workExperience.map((w) => w.id === id ? { ...w, [key]: val } : w) })

  const setEdu = (id: string, key: keyof Education, val: string | boolean) =>
    onChange({ ...cv, education: cv.education.map((e) => e.id === id ? { ...e, [key]: val } : e) })

  const addWork = () => {
    const newEntry: WorkExperience = { id: `exp${Date.now()}`, jobTitle: '', employer: '', city: '', country: '', startDate: '', endDate: '', current: false, description: '', activities: [] }
    onChange({ ...cv, workExperience: [newEntry, ...cv.workExperience] })
  }

  const removeWork = (id: string) =>
    onChange({ ...cv, workExperience: cv.workExperience.filter((w) => w.id !== id) })

  const addEdu = () => {
    const newEntry: Education = { id: `edu${Date.now()}`, title: '', institution: '', city: '', country: '', startDate: '', endDate: '', current: false, eqfLevel: '', field: '' }
    onChange({ ...cv, education: [newEntry, ...cv.education] })
  }

  const removeEdu = (id: string) =>
    onChange({ ...cv, education: cv.education.filter((e) => e.id !== id) })

  const addLanguage = () =>
    onChange({ ...cv, languages: [...cv.languages, { language: '', listening: 'B2', reading: 'B2', spokenProduction: 'B2', spokenInteraction: 'B2', writing: 'B2', native: false }] })

  const removeLanguage = (i: number) =>
    onChange({ ...cv, languages: cv.languages.filter((_, idx) => idx !== i) })

  // AI regenerate helpers
  const aiRegen = async (field: string, prompt: string) => {
    if (!combinedText) return
    setRegenLoading((p) => ({ ...p, [field]: true }))
    try {
      const res = await fetch('/api/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, prompt, combinedText }),
      })
      const data = await res.json()
      if (data.result) {
        if (field === 'personalStatement') onChange({ ...cv, personalStatement: data.result })
        if (field === 'activities') {
          // applied per-job externally — skip here
        }
      }
    } catch { /* silent */ }
    setRegenLoading((p) => ({ ...p, [field]: false }))
  }

  const aiRegenActivities = async (jobId: string, jobTitle: string, employer: string) => {
    if (!combinedText) return
    const key = `activities_${jobId}`
    setRegenLoading((p) => ({ ...p, [key]: true }))
    try {
      const res = await fetch('/api/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'activities',
          prompt: `Rewrite bullet points for role: ${jobTitle} at ${employer}. Make them achievement-oriented with metrics where possible.`,
          combinedText,
        }),
      })
      const data = await res.json()
      if (data.result && Array.isArray(data.result)) {
        setWork(jobId, 'activities', data.result)
      }
    } catch { /* silent */ }
    setRegenLoading((p) => ({ ...p, [key]: false }))
  }

  const p = cv.personalInfo

  return (
    <div>
      <CompletenessBar cv={cv} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTabAndNotify(t.key)} style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: tab === t.key ? 'var(--accent)' : 'var(--bg3)',
            color: tab === t.key ? 'white' : 'var(--text-2)',
            border: `1px solid ${tab === t.key ? 'transparent' : 'var(--border)'}`,
            cursor: 'pointer',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── PERSONAL ─────────────────────────────────────────────────────── */}
      {tab === 'personal' && (
        <div>
          <PhotoUpload
            value={p.photo ?? null}
            onChange={(url) => onChange({ ...cv, personalInfo: { ...p, photo: url ?? undefined } })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['firstName', 'First Name'], ['lastName', 'Last Name'],
              ['email', 'Email'], ['phone', 'Phone'],
              ['dateOfBirth', 'Date of Birth (DD/MM/YYYY)'], ['nationality', 'Nationality'],
              ['city', 'City'], ['country', 'Country'],
              ['gender', 'Gender'], [''],
            ].map(([key, label], idx) => {
              if (!key) return <div key={idx} />
              return (
                <div key={key} style={{ ...fld, paddingRight: 8 }}>
                  <label style={lbl}>{label}</label>
                  <input value={(p as unknown as Record<string, string>)[key] ?? ''} onChange={(e) => setPersonal(key, e.target.value)} />
                </div>
              )
            })}
          </div>
          <div style={fld}>
            <label style={lbl}>Street Address</label>
            <input value={p.address ?? ''} onChange={(e) => setPersonal('address', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[['linkedin', 'LinkedIn URL'], ['website', 'Website / Portfolio']].map(([key, label]) => (
              <div key={key} style={{ ...fld, paddingRight: 8 }}>
                <label style={lbl}>{label}</label>
                <input value={(p as unknown as Record<string, string>)[key] ?? ''} onChange={(e) => setPersonal(key, e.target.value)} placeholder={key === 'linkedin' ? 'linkedin.com/in/...' : 'yoursite.com'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUMMARY ──────────────────────────────────────────────────────── */}
      {tab === 'statement' && (
        <div style={fld}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={lbl}>Professional Summary</label>
            {combinedText && (
              <AIRegenerateBtn
                label="AI Rewrite"
                loading={!!regenLoading['personalStatement']}
                onClick={() => aiRegen('personalStatement', 'Rewrite the professional summary to be compelling, first-person, 2-4 sentences.')}
              />
            )}
          </div>
          <textarea
            value={cv.personalStatement ?? ''}
            onChange={(e) => onChange({ ...cv, personalStatement: e.target.value })}
            rows={7}
            style={{ resize: 'vertical' }}
            placeholder="2–4 sentences. First person. Focus on your unique value and career goals..."
          />
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {cv.personalStatement?.length ?? 0} characters · Aim for 150-300
          </p>
        </div>
      )}

      {/* ── WORK ─────────────────────────────────────────────────────────── */}
      {tab === 'work' && (
        <div>
          <button onClick={addWork} style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 12, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-2)', border: '1px dashed rgba(108,99,255,0.4)', cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>
            + Add Work Experience
          </button>
          {cv.workExperience?.map((w, idx) => (
            <div key={w.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Position {idx + 1}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={w.current} onChange={(e) => setWork(w.id, 'current', e.target.checked)} />
                    Current
                  </label>
                  <button onClick={() => removeWork(w.id)} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {[['jobTitle', 'Job Title'], ['employer', 'Employer'], ['city', 'City'], ['country', 'Country'], ['startDate', 'Start MM/YYYY'], ['endDate', 'End MM/YYYY']].map(([k, l]) => (
                  <div key={k} style={fld}>
                    <label style={lbl}>{l}</label>
                    <input value={(w as unknown as Record<string, string>)[k] ?? ''} onChange={(e) => setWork(w.id, k as keyof WorkExperience, e.target.value)} />
                  </div>
                ))}
              </div>
              <div style={fld}>
                <label style={lbl}>Role Description</label>
                <textarea value={w.description ?? ''} onChange={(e) => setWork(w.id, 'description', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
              </div>
              <div style={fld}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={lbl}>Activities / Achievements (one per line)</label>
                  {combinedText && (
                    <AIRegenerateBtn
                      label="AI Improve"
                      loading={!!regenLoading[`activities_${w.id}`]}
                      onClick={() => aiRegenActivities(w.id, w.jobTitle, w.employer)}
                    />
                  )}
                </div>
                <textarea
                  value={(w.activities ?? []).join('\n')}
                  onChange={(e) => setWork(w.id, 'activities', e.target.value.split('\n'))}
                  rows={4}
                  style={{ resize: 'vertical' }}
                  placeholder="Led team of 8 engineers to deliver X...&#10;Increased revenue by 25% through...&#10;Built and deployed..."
                />
              </div>
            </div>
          ))}
          {!cv.workExperience?.length && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-3)', fontSize: 13 }}>
              No work experience added yet. Click the button above to add positions.
            </div>
          )}
        </div>
      )}

      {/* ── EDUCATION ────────────────────────────────────────────────────── */}
      {tab === 'education' && (
        <div>
          <button onClick={addEdu} style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 12, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-2)', border: '1px dashed rgba(108,99,255,0.4)', cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>
            + Add Education
          </button>
          {cv.education?.map((e, idx) => (
            <div key={e.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Education {idx + 1}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={e.current} onChange={(ev) => setEdu(e.id, 'current', ev.target.checked)} />
                    In progress
                  </label>
                  <button onClick={() => removeEdu(e.id)} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['title', 'Degree / Certificate'], ['institution', 'Institution'], ['field', 'Field of Study'], ['eqfLevel', 'EQF Level (1-8)'], ['city', 'City'], ['country', 'Country'], ['startDate', 'Start MM/YYYY'], ['endDate', 'End MM/YYYY']].map(([k, l]) => (
                  <div key={k} style={fld}>
                    <label style={lbl}>{l}</label>
                    <input value={(e as unknown as Record<string, string>)[k] ?? ''} onChange={(ev) => setEdu(e.id, k as keyof Education, ev.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LANGUAGES ────────────────────────────────────────────────────── */}
      {tab === 'languages' && (
        <div>
          <button onClick={addLanguage} style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 12, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-2)', border: '1px dashed rgba(108,99,255,0.4)', cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>
            + Add Language
          </button>
          {cv.languages?.map((lang, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    value={lang.language}
                    onChange={(e) => { const u = [...cv.languages]; u[i] = { ...lang, language: e.target.value }; onChange({ ...cv, languages: u }) }}
                    placeholder="Language name"
                    style={{ width: 140 }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!lang.native} onChange={(e) => { const u = [...cv.languages]; u[i] = { ...lang, native: e.target.checked }; onChange({ ...cv, languages: u }) }} />
                    Native
                  </label>
                </div>
                <button onClick={() => removeLanguage(i)} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>Remove</button>
              </div>
              {!lang.native && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {['listening', 'reading', 'spokenProduction', 'spokenInteraction', 'writing'].map((sk) => (
                    <div key={sk} style={fld}>
                      <label style={{ ...lbl, fontSize: 9 }}>{sk.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <select value={(lang as unknown as Record<string, string>)[sk]} onChange={(e) => { const u = [...cv.languages]; u[i] = { ...lang, [sk]: e.target.value }; onChange({ ...cv, languages: u }) }} style={{ padding: '6px 4px', fontSize: 11 }}>
                        {['A1','A2','B1','B2','C1','C2','Native'].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ ...fld, marginTop: 8 }}>
                <label style={lbl}>Certificate (optional)</label>
                <input value={lang.certificate ?? ''} onChange={(e) => { const u = [...cv.languages]; u[i] = { ...lang, certificate: e.target.value }; onChange({ ...cv, languages: u }) }} placeholder="e.g. IELTS 7.5, DELF B2, TELC C1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SKILLS ───────────────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Digital Skills</div>
          {cv.digitalSkills?.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div style={fld}>
                {i === 0 && <label style={lbl}>Skill / Tool</label>}
                <input value={d.area} onChange={(e) => { const s = [...cv.digitalSkills]; s[i] = { ...d, area: e.target.value }; onChange({ ...cv, digitalSkills: s }) }} placeholder="e.g. Python, Excel, AutoCAD" />
              </div>
              <div style={fld}>
                {i === 0 && <label style={lbl}>Level</label>}
                <select value={d.level} onChange={(e) => { const s = [...cv.digitalSkills]; s[i] = { ...d, level: e.target.value as 'Basic' | 'Intermediate' | 'Advanced' }; onChange({ ...cv, digitalSkills: s }) }}>
                  {['Basic','Intermediate','Advanced'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={() => onChange({ ...cv, digitalSkills: cv.digitalSkills.filter((_, j) => j !== i) })} style={{ padding: '8px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', marginBottom: 12 }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange({ ...cv, digitalSkills: [...cv.digitalSkills, { area: '', level: 'Intermediate' }] })} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-2)', border: '1px dashed rgba(108,99,255,0.4)', cursor: 'pointer', marginBottom: 20 }}>+ Add Digital Skill</button>

          <div style={{ fontWeight: 600, fontSize: 13, margin: '4px 0 10px' }}>Other Skills</div>
          {cv.otherSkills?.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
              <input value={s.description} onChange={(e) => { const sk = [...cv.otherSkills]; sk[i] = { ...s, description: e.target.value }; onChange({ ...cv, otherSkills: sk }) }} placeholder="e.g. Leadership, Project management, Photography" />
              <button onClick={() => onChange({ ...cv, otherSkills: cv.otherSkills.filter((_, j) => j !== i) })} style={{ padding: '8px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange({ ...cv, otherSkills: [...cv.otherSkills, { category: '', description: '' }] })} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, background: 'rgba(108,99,255,0.1)', color: 'var(--accent-2)', border: '1px dashed rgba(108,99,255,0.4)', cursor: 'pointer', marginBottom: 20 }}>+ Add Other Skill</button>

          <div style={{ fontWeight: 600, fontSize: 13, margin: '4px 0 10px' }}>Driving Licence</div>
          <input value={(cv.drivingLicense ?? []).join(', ')} onChange={(e) => onChange({ ...cv, drivingLicense: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="e.g. A, B, C — comma separated" />

          <div style={{ fontWeight: 600, fontSize: 13, margin: '20px 0 10px' }}>Additional Information</div>
          <textarea value={cv.additionalInfo ?? ''} onChange={(e) => onChange({ ...cv, additionalInfo: e.target.value })} rows={3} placeholder="Hobbies, memberships, publications, references available on request..." style={{ resize: 'vertical' }} />
        </div>
      )}
    </div>
  )
}