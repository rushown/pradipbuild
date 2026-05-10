'use client'
import { useCallback, useRef, useState } from 'react'

interface PhotoUploadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
}

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      // Resize to max 400x500 maintaining aspect ratio
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_W = 400, MAX_H = 500
        let w = img.width, h = img.height
        if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W }
        if (h > MAX_H) { w = (w * MAX_H) / h; h = MAX_H }
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        onChange(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
        Profile Photo
      </label>

      {value ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 90, height: 110, borderRadius: 8, overflow: 'hidden',
            border: '2px solid var(--border-strong)',
            flexShrink: 0,
          }}>
            <img src={value} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
              Photo will appear in your Europass CV header. ✓ Europass recommends a professional headshot.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => inputRef.current?.click()}
                style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, background: 'var(--bg3)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >Change</button>
              <button
                onClick={() => onChange(null)}
                style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}
              >Remove</button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
            borderRadius: 10,
            padding: '20px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--accent-glow)' : 'transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🖼</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Upload your photo</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>JPG, PNG, WEBP · max 5MB · Drag & drop or click</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Recommended: professional headshot, plain background</div>
        </div>
      )}

      {error && (
        <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>⚠ {error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }}
      />
    </div>
  )
}