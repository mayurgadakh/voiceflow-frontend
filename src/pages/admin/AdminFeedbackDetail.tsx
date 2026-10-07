import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SentimentBadge, StatusBadge } from '../../components/Badges'
import { useApi, usePolledItem } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { ERROR_MESSAGES, FINAL_STATUSES, formatDate, formatDuration } from '../../lib/format'
import { languageName } from '../../lib/languages'
import type { AdminFeedback } from '../../types'

const LOW_CONFIDENCE = 0.6

function Audio({ id }: { id: string }) {
  const { data, error } = useApi<{ url: string }>(`/admin/feedback/${id}/audio`)
  if (error) return <p className="muted">{error === 'Audio has been removed' ? 'Audio has been removed.' : error}</p>
  if (!data) return <p className="muted">Loading audio...</p>
  return <audio controls src={data.url} style={{ width: '100%' }} />
}

export default function AdminFeedbackDetail() {
  const { id } = useParams()
  const { data: feedback, error, restart } = usePolledItem<AdminFeedback>(`/admin/feedback/${id}`, FINAL_STATUSES)
  const [reprocessing, setReprocessing] = useState(false)
  const [actionError, setActionError] = useState('')

  async function reprocess() {
    setActionError('')
    setReprocessing(true)
    try {
      await api(`/admin/feedback/${id}/reprocess`, { method: 'POST' })
      restart()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setReprocessing(false)
    }
  }

  const { transcription, analysis } = feedback ?? {}
  const canReprocess = feedback && (feedback.status === 'COMPLETED' || feedback.status === 'FAILED')

  return (
    <>
      <Link to="/admin" className="back">
        ← All feedback
      </Link>
      {error && !feedback && <p className="error">{error}</p>}
      {feedback && (
        <>
          <div className="panel">
            <div className="row" style={{ marginBottom: 8 }}>
              <h1 style={{ margin: 0 }}>{feedback.user.name}</h1>
              <StatusBadge status={feedback.status} />
              {analysis && <SentimentBadge label={analysis.label} />}
              {analysis?.urgent && <span className="badge urgent">Urgent</span>}
              <span className="spacer" />
              {canReprocess && (
                <button onClick={reprocess} disabled={reprocessing}>
                  {reprocessing ? 'Starting...' : 'Reprocess'}
                </button>
              )}
            </div>
            <p className="muted">
              {feedback.user.email} · {formatDate(feedback.createdAt)} · {formatDuration(feedback.durationMs)} · attempt{' '}
              {feedback.attempt}
            </p>
            {actionError && <p className="error">{actionError}</p>}
            {feedback.status === 'FAILED' && (
              <p className="error">
                {(feedback.errorCode && ERROR_MESSAGES[feedback.errorCode]) || 'Processing failed.'}{' '}
                <span className="muted">({feedback.errorCode})</span>
              </p>
            )}
            <Audio id={feedback.id} />
          </div>

          {analysis && (
            <div className="panel">
              <h2>Analysis</h2>
              <p style={{ margin: '0 0 8px' }}>{analysis.summary}</p>
              <div className="row">
                <span className="muted">Score {analysis.score.toFixed(2)}</span>
                {analysis.topics.map((topic) => (
                  <span className="badge" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {analysis.model}
              </p>
            </div>
          )}

          {transcription && (
            <div className="panel">
              <div className="row" style={{ marginBottom: 8 }}>
                <h2 style={{ margin: 0 }}>Transcript</h2>
                <span className="badge">{languageName(transcription.languageCode)}</span>
                {transcription.languageProb != null && transcription.languageProb < LOW_CONFIDENCE && (
                  <span className="badge warn">
                    Low confidence ({Math.round(transcription.languageProb * 100)}%)
                  </span>
                )}
              </div>
              <h2 className="muted">Original</h2>
              <p className="transcript">{transcription.originalText}</p>
              <h2 className="muted" style={{ marginTop: 16 }}>
                English
              </h2>
              <p className="transcript">{transcription.englishText}</p>
              <p className="muted" style={{ marginBottom: 0 }}>
                {transcription.model}
              </p>
            </div>
          )}

          {!transcription && !feedback.errorCode && feedback.status !== 'FAILED' && (
            <p className="muted">Waiting for processing. This page updates by itself.</p>
          )}
        </>
      )}
    </>
  )
}
