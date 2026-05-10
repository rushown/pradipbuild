'use client'
import type { CEFRLevel } from '@/types/europass'

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_COLOR: Record<CEFRLevel, string> = {
  A1: '#374151', A2: '#4b5563',
  B1: '#1e40af', B2: '#2563eb',
  C1: '#7c3aed', C2: '#6d28d9',
  Native: '#059669',
}

interface CEFRGridProps {
  listening: CEFRLevel
  reading: CEFRLevel
  spokenProduction: CEFRLevel
  spokenInteraction: CEFRLevel
  writing: CEFRLevel
  native?: boolean
}

export default function CEFRGrid(props: CEFRGridProps) {
  if (props.native) {
    return (
      <div style={{ padding: '8px 0', color: '#059669', fontWeight: 600, fontSize: 13 }}>
        Native / Mother tongue
      </div>
    )
  }

  const skills = [
    { label: 'Listening', value: props.listening },
    { label: 'Reading', value: props.reading },
    { label: 'Spoken production', value: props.spokenProduction },
    { label: 'Spoken interaction', value: props.spokenInteraction },
    { label: 'Writing', value: props.writing },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 6 }}>
      {skills.map((s) => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>{s.label}</div>
          <div
            style={{
              background: CEFR_COLOR[s.value] || '#374151',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 0',
              borderRadius: 4,
            }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
            {LEVELS.indexOf(s.value as CEFRLevel) >= 0
              ? ['Basic', 'Basic', 'Independent', 'Independent', 'Proficient', 'Proficient'][
                  LEVELS.indexOf(s.value as CEFRLevel)
                ]
              : ''}
          </div>
        </div>
      ))}
    </div>
  )
}
