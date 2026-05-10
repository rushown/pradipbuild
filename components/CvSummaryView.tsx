'use client'
import type { CvSummary } from '@/types/europass'

interface CvSummaryViewProps {
  summary: CvSummary
  printRef?: React.RefObject<HTMLDivElement | null>
}

export default function CvSummaryView({ summary: s, printRef }: CvSummaryViewProps) {
  return (
    <div
      ref={printRef as React.RefObject<HTMLDivElement>}
      className="europass-doc"
      style={{
        background: 'white', color: '#1a1a2e',
        fontFamily: '"DM Sans", Arial, sans-serif',
        fontSize: 12, lineHeight: 1.6,
        maxWidth: 794, margin: '0 auto',
        padding: '48px 56px',
        boxShadow: '0 4px 48px rgba(0,0,0,0.4)',
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: '3px solid #6c63ff', paddingBottom: 16, marginBottom: 28 }}>
        <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          PradipBuild · Career Analysis Report
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 4, fontFamily: '"Syne", sans-serif' }}>
          {s.headline}
        </h1>
        <p style={{ fontSize: 12, color: '#4b5563', fontStyle: 'italic' }}>{s.professionalSummary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Left col */}
        <div>
          {/* Top Strengths */}
          <Section title="Top Strengths" icon="💪" color="#6c63ff">
            {s.topStrengths?.map((t, i) => (
              <Item key={i} color="#6c63ff">{t}</Item>
            ))}
          </Section>

          {/* Key Achievements */}
          <Section title="Key Achievements" icon="🏆" color="#f59e0b">
            {s.keyAchievements?.map((a, i) => (
              <Item key={i} color="#f59e0b">{a}</Item>
            ))}
          </Section>

          {/* Career Trajectory */}
          <Section title="Career Trajectory" icon="📈" color="#22d3a0">
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6 }}>{s.careerTrajectory}</p>
          </Section>
        </div>

        {/* Right col */}
        <div>
          {/* Skills */}
          <Section title="Skills Overview" icon="🔧" color="#3b82f6">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {s.skillsOverview?.map((sk, i) => (
                <span key={i} style={{
                  background: '#eff6ff', color: '#1e40af',
                  fontSize: 10, fontWeight: 500,
                  padding: '3px 9px', borderRadius: 99,
                }}>{sk}</span>
              ))}
            </div>
          </Section>

          {/* Recommended Roles */}
          <Section title="Recommended Roles" icon="🎯" color="#a78bfa">
            {s.recommendedRoles?.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ color: '#a78bfa', fontSize: 10 }}>▸</span>
                <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{r}</span>
              </div>
            ))}
          </Section>

          {/* Gaps */}
          {s.gaps?.length > 0 && (
            <Section title="Areas to Address" icon="⚠️" color="#f87171">
              {s.gaps?.map((g, i) => (
                <Item key={i} color="#f87171">{g}</Item>
              ))}
            </Section>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32, borderTop: '1px solid #e5e7eb', paddingTop: 10, fontSize: 9, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>Career Analysis · PradipBuild</span>
        <span>{new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}

function Section({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: `${color}18`, color,
        fontWeight: 700, fontSize: 10.5,
        padding: '4px 10px', borderRadius: 4,
        marginBottom: 10, letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  )
}

function Item({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
      <span style={{ color, flexShrink: 0, fontSize: 10, marginTop: 2 }}>●</span>
      <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}
