'use client'
import type { EuropassCV } from '@/types/europass'

interface CompletenessBarProps {
  cv: EuropassCV
}

interface Section {
  key: string
  label: string
  score: () => number
}

export default function CompletenessBar({ cv }: CompletenessBarProps) {
  const p = cv.personalInfo

  const sections: Section[] = [
    {
      key: 'personal',
      label: 'Personal',
      score: () => {
        const fields = [p.firstName, p.lastName, p.email, p.phone, p.address, p.city, p.country, p.nationality, p.dateOfBirth]
        const filled = fields.filter(Boolean).length
        const bonus = p.photo ? 10 : 0
        return Math.min(100, Math.round((filled / fields.length) * 90) + bonus)
      },
    },
    {
      key: 'statement',
      label: 'Summary',
      score: () => {
        const len = cv.personalStatement?.length ?? 0
        if (len === 0) return 0
        if (len < 50) return 30
        if (len < 150) return 70
        return 100
      },
    },
    {
      key: 'work',
      label: 'Experience',
      score: () => {
        if (!cv.workExperience?.length) return 0
        const hasActivities = cv.workExperience.some((w) => w.activities?.length > 0)
        return cv.workExperience.length >= 2 ? (hasActivities ? 100 : 70) : 50
      },
    },
    {
      key: 'education',
      label: 'Education',
      score: () => {
        if (!cv.education?.length) return 0
        return cv.education.length >= 1 ? 100 : 50
      },
    },
    {
      key: 'languages',
      label: 'Languages',
      score: () => {
        if (!cv.languages?.length) return 0
        const hasNative = cv.languages.some((l) => l.native)
        return cv.languages.length >= 2 ? 100 : hasNative ? 70 : 50
      },
    },
    {
      key: 'skills',
      label: 'Skills',
      score: () => {
        const digital = cv.digitalSkills?.length ?? 0
        const other = cv.otherSkills?.length ?? 0
        if (digital + other === 0) return 0
        if (digital >= 3 && other >= 1) return 100
        return 50
      },
    },
  ]

  const overall = Math.round(sections.reduce((acc, s) => acc + s.score(), 0) / sections.length)
  const color = overall >= 80 ? '#22d3a0' : overall >= 50 ? '#f59e0b' : '#f87171'

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>CV Completeness</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{overall}%</span>
      </div>

      {/* Overall bar */}
      <div style={{ background: 'var(--bg)', borderRadius: 99, height: 6, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          width: `${overall}%`, height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Section bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {sections.map((s) => {
          const sc = s.score()
          const c = sc >= 80 ? '#22d3a0' : sc >= 40 ? '#f59e0b' : '#f87171'
          return (
            <div key={s.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</span>
                <span style={{ fontSize: 10, color: c, fontWeight: 600 }}>{sc}%</span>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
                <div style={{ width: `${sc}%`, height: '100%', background: c, borderRadius: 99, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}