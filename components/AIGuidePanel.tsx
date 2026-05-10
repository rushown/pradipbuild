'use client'
import { useEffect, useState, useCallback } from 'react'
import type { AIGuide, EuropassCV, AppStep, GenerationMode } from '@/types/europass'

interface AIGuideProps {
  step: AppStep
  mode: GenerationMode
  cv: EuropassCV
  onJumpToTab?: (tab: string) => void
}

const PRIORITY_CONFIG = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', icon: '🔴', label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  icon: '🟡', label: 'High' },
  medium:   { color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.25)', icon: '🔵', label: 'Medium' },
  low:      { color: '#22d3a0', bg: 'rgba(34,211,160,0.1)', border: 'rgba(34,211,160,0.25)', icon: '🟢', label: 'Low' },
}

function Donut({ score }: { score: number }) {
  const r = 24, c = 2 * Math.PI * r
  const filled = (score / 100) * c
  const color = score >= 80 ? '#22d3a0' : score >= 50 ? '#f59e0b' : '#f87171'
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--bg3)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${filled} ${c}`} strokeLinecap="round"
        transform="rotate(-90 32 32)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
        {score}%
      </text>
    </svg>
  )
}

// Build a lightweight snapshot for the API (don't send full text)
function buildSnapshot(cv: EuropassCV) {
  return {
    hasFirstName: !!cv.personalInfo.firstName,
    hasLastName: !!cv.personalInfo.lastName,
    hasEmail: !!cv.personalInfo.email,
    hasPhone: !!cv.personalInfo.phone,
    hasAddress: !!cv.personalInfo.address,
    hasPhoto: !!cv.personalInfo.photo,
    hasLinkedIn: !!cv.personalInfo.linkedin,
    hasPersonalStatement: cv.personalStatement?.length > 20,
    personalStatementLength: cv.personalStatement?.length ?? 0,
    workExperienceCount: cv.workExperience?.length ?? 0,
    workExperienceHasActivities: cv.workExperience?.some((w) => w.activities?.length > 0),
    educationCount: cv.education?.length ?? 0,
    languagesCount: cv.languages?.length ?? 0,
    hasNativeLanguage: cv.languages?.some((l) => l.native),
    digitalSkillsCount: cv.digitalSkills?.length ?? 0,
    otherSkillsCount: cv.otherSkills?.length ?? 0,
    hasDrivingLicense: (cv.drivingLicense?.length ?? 0) > 0,
    hasAdditionalInfo: !!cv.additionalInfo,
  }
}

export default function AIGuidePanel({ step, mode, cv, onJumpToTab }: AIGuideProps) {
  const [guide, setGuide] = useState<AIGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [lastScore, setLastScore] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchGuide = useCallback(async () => {
    if (step !== 'review') return
    setLoading(true)
    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, mode, cvSnapshot: buildSnapshot(cv) }),
      })
      if (!res.ok) return
      const data = await res.json()
      setGuide(data)
      setLastScore(data.completenessScore ?? 0)
    } catch {
      // silently fail — guide is non-critical
    } finally {
      setLoading(false)
    }
  }, [step, mode, cv])

  // Fetch on mount when in review step
  useEffect(() => {
    if (step === 'review') fetchGuide()
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  if (step !== 'review') return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      width: collapsed ? 56 : 320,
      maxHeight: collapsed ? 56 : 'calc(100vh - 120px)',
      background: 'var(--bg2)',
      border: '1px solid var(--border-strong)',
      borderRadius: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      zIndex: 200,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      display: 'flex',
      flexDirection: 'column',
    }} className="no-print">

      {/* Toggle bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '14px' : '14px 16px',
          background: 'var(--bg3)', border: 'none', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--border)',
          width: '100%', flexShrink: 0,
        }}
      >
        {collapsed ? (
          <span style={{ fontSize: 20 }}>🤖</span>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                AI Guide
              </span>
              {guide && (
                <span style={{
                  background: 'var(--accent-glow)', color: 'var(--accent-2)',
                  fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
                }}>
                  {guide.actions?.filter(a => a.priority === 'critical' || a.priority === 'high').length ?? 0} actions
                </span>
              )}
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: 16 }}>▼</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Score ring */}
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)' }}>
            <Donut score={guide?.completenessScore ?? lastScore} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>CV Completeness</div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {guide?.stepSummary ?? 'Analysing your CV...'}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && !guide && (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Analysing your CV...</div>
              <div style={{ width: 28, height: 28, margin: '0 auto', borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Actions */}
          {guide?.actions?.length > 0 && (
            <div style={{ padding: '12px 12px 4px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Suggested improvements
              </div>
              {guide.actions.map((action) => {
                const cfg = PRIORITY_CONFIG[action.priority]
                const isOpen = expanded === action.id
                return (
                  <div
                    key={action.id}
                    style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: 8,
                      marginBottom: 7,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : action.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color, lineHeight: 1.4 }}>
                          {action.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{action.section}</div>
                      </div>
                      <span style={{ color: 'var(--text-3)', fontSize: 12, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 12px 12px' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
                          {action.description}
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, marginBottom: 3 }}>HOW TO FIX</div>
                          <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{action.howTo}</p>
                        </div>
                        {action.ctaTarget && onJumpToTab && (
                          <button
                            onClick={() => { onJumpToTab(action.ctaTarget!); setExpanded(null) }}
                            style={{
                              width: '100%', padding: '7px', borderRadius: 6,
                              background: cfg.color, color: 'white',
                              fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                            }}
                          >
                            {action.ctaLabel ?? `Go to ${action.section}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Next step */}
          {guide?.nextStep && (
            <div style={{ margin: '8px 12px', padding: '10px 12px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--accent-2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Next step</div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{guide.nextStep}</p>
            </div>
          )}

          {/* Encouragement */}
          {guide?.encouragement && (
            <div style={{ padding: '10px 16px 16px', textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
              {guide.encouragement}
            </div>
          )}

          {/* Refresh */}
          <div style={{ padding: '0 12px 16px', display: 'flex', gap: 8 }}>
            <button
              onClick={fetchGuide}
              disabled={loading}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 11,
                background: 'var(--bg3)', color: 'var(--text-2)',
                border: '1px solid var(--border)', cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? '⟳ Refreshing...' : '⟳ Refresh guide'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}