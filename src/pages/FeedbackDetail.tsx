import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/Badges'
import { usePolledItem } from '../hooks/useApi'
import { ERROR_MESSAGES, FINAL_STATUSES, formatDate, formatDuration } from '../lib/format'
import { languageName } from '../lib/languages'
import type { MyFeedback } from '../types'

export default function FeedbackDetail() {
  const { id } = useParams()
  const { data: feedback, error } = usePolledItem<MyFeedback>(`/feedback/${id}`, FINAL_STATUSES)

  return (
    <>
      <Link to="/" className="back">
        ← My feedback
      </Link>
      {error && !feedback && <p className="error">{error}</p>}
      {feedback && (
        <div className="panel">
          <div className="row" style={{ marginBottom: 12 }}>
            <h1 style={{ margin: 0 }}>Feedback</h1>
            <StatusBadge status={feedback.status} />
          </div>
          <p className="muted">
            {formatDate(feedback.createdAt)} · {formatDuration(feedback.durationMs)}
          </p>

          {feedback.status === 'COMPLETED' && feedback.transcription ? (
            <>
              <h2>
                What we heard <span className="muted">({languageName(feedback.transcription.languageCode)})</span>
              </h2>
              <p className="transcript">{feedback.transcription.originalText}</p>
              {feedback.transcription.englishText !== feedback.transcription.originalText && (
                <>
                  <h2 style={{ marginTop: 16 }}>In English</h2>
                  <p className="transcript">{feedback.transcription.englishText}</p>
                </>
              )}
            </>
          ) : feedback.status === 'FAILED' || feedback.status === 'EXPIRED' ? (
            <p className="error">
              {(feedback.errorCode && ERROR_MESSAGES[feedback.errorCode]) || 'We could not process this feedback.'}{' '}
              <Link to="/record">Record again</Link>
            </p>
          ) : (
            <p className="muted">We are processing your feedback. This page updates by itself.</p>
          )}
        </div>
      )}
    </>
  )
}
