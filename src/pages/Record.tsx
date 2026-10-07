import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MAX_SECONDS, useRecorder } from '../hooks/useRecorder'
import { api } from '../lib/api'
import { LANGUAGES } from '../lib/languages'

export default function Record() {
  const { isRecording, seconds, recording, error: recorderError, start, stop, discard } = useRecorder()
  const [language, setLanguage] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!recording) return
    setError('')
    setSubmitting(true)
    try {
      const { id, uploadUrl } = await api<{ id: string; uploadUrl: string }>('/feedback', {
        method: 'POST',
        body: {
          mimeType: recording.mimeType,
          sizeBytes: recording.blob.size,
          durationMs: recording.durationMs,
          consent,
          languageHint: language || undefined,
        },
      })
      // Audio goes straight to storage, never through our API
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': recording.mimeType.split(';')[0] },
        body: recording.blob,
      })
      if (!upload.ok) throw new Error('Upload failed. Please try again.')
      await api(`/feedback/${id}/complete`, { method: 'POST' })
      navigate(`/feedback/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Record feedback</h1>
      <label>
        Language
        <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isRecording || submitting}>
          <option value="">Auto-detect</option>
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {isRecording ? (
        <button type="button" onClick={stop}>
          Stop ({seconds}s / {MAX_SECONDS}s)
        </button>
      ) : (
        <button type="button" onClick={start} disabled={submitting}>
          {recording ? 'Re-record' : 'Start recording'}
        </button>
      )}

      {recording && !isRecording && (
        <>
          <audio controls src={recording.url} />
          <button type="button" onClick={discard} disabled={submitting}>
            Discard
          </button>
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I agree my voice
            recording is processed by speech-to-text and AI services to analyse feedback.
          </label>
          <button type="submit" disabled={!consent || submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </>
      )}

      {(recorderError || error) && <p className="error">{recorderError || error}</p>}
      <Link to="/">Cancel</Link>
    </form>
  )
}
