import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { AudioPlayer } from '../../components/AudioPlayer'
import { BackLink } from '../../components/BackLink'
import { SentimentBadge, StatusBadge, UrgentBadge } from '../../components/Badges'
import { useApi, usePolledItem } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { ERROR_MESSAGES, FINAL_STATUSES, formatDate, formatDuration, sentenceCase } from '../../lib/format'
import { languageName } from '../../lib/languages'
import type { AdminFeedback } from '../../types'

const LOW_CONFIDENCE = 0.6
const formatSize = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`

function Audio({ id, durationMs }: { id: string; durationMs: number }) {
  const { data, error } = useApi<{ url: string }>(`/admin/feedback/${id}/audio`)
  if (error) return <p className="text-sm text-muted-foreground">{error === 'Audio has been removed' ? 'The audio was deleted after the retention period.' : error}</p>
  if (!data) return <Skeleton className="h-10 w-full" />
  return <AudioPlayer src={data.url} durationMs={durationMs} label="customer recording" />
}

// A position on the -1 to +1 scale the model scores against
function ScoreMeter({ score }: { score: number }) {
  const position = ((Math.max(-1, Math.min(1, score)) + 1) / 2) * 100
  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-muted" role="img" aria-label={`Sentiment score ${score.toFixed(2)} on a scale from -1 to 1`}>
        <span className="absolute top-1/2 left-1/2 h-3 w-px -translate-y-1/2 bg-border" aria-hidden="true" />
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Negative</span>
        <span className="tabular-nums">{score > 0 ? '+' : ''}{score.toFixed(2)}</span>
        <span>Positive</span>
      </div>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

export default function AdminFeedbackDetail() {
  const { id } = useParams()
  const { data: feedback, error, restart } = usePolledItem<AdminFeedback>(`/admin/feedback/${id}`, FINAL_STATUSES)
  const [reprocessing, setReprocessing] = useState(false)

  async function reprocess() {
    setReprocessing(true)
    try {
      await api(`/admin/feedback/${id}/reprocess`, { method: 'POST' })
      toast.success('Reprocessing started')
      restart()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start reprocessing')
    } finally {
      setReprocessing(false)
    }
  }

  if (error && !feedback) {
    return (
      <>
        <BackLink to="/admin/feedback">All feedback</BackLink>
        <Alert variant="destructive">
          <AlertTitle>Could not load this feedback</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </>
    )
  }
  if (!feedback) {
    return (
      <>
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </>
    )
  }

  const { transcription, analysis } = feedback
  const canReprocess = feedback.status === 'COMPLETED' || feedback.status === 'FAILED'
  const inProgress = !FINAL_STATUSES.includes(feedback.status)
  const sameText = transcription?.originalText === transcription?.englishText
  const lowConfidence = transcription?.languageProb != null && transcription.languageProb < LOW_CONFIDENCE

  return (
    <>
      <BackLink to="/admin/feedback">All feedback</BackLink>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{feedback.user.name}</h1>
            <StatusBadge status={feedback.status} />
            {analysis && <SentimentBadge label={analysis.label} />}
            {analysis?.urgent && <UrgentBadge />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {feedback.user.email}. Submitted {formatDate(feedback.createdAt)}.
          </p>
        </div>
        {canReprocess && (
          <Button variant="outline" onClick={reprocess} disabled={reprocessing}>
            {reprocessing ? <Spinner /> : <RefreshCw />}
            Reprocess
          </Button>
        )}
      </div>

      {feedback.status === 'FAILED' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Processing failed</AlertTitle>
          <AlertDescription>
            {(feedback.errorCode && ERROR_MESSAGES[feedback.errorCode]) || 'The pipeline stopped before finishing.'}{' '}
            <span className="text-muted-foreground">Code: {feedback.errorCode ?? 'unknown'}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recording</CardTitle>
              <CardDescription>{formatDuration(feedback.durationMs)} long</CardDescription>
            </CardHeader>
            <CardContent>
              <Audio id={feedback.id} durationMs={feedback.durationMs} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Transcript</CardTitle>
                {transcription && <Badge variant="secondary">{languageName(transcription.languageCode)}</Badge>}
                {lowConfidence && transcription?.languageProb != null && (
                  <Badge variant="outline">Language confidence {Math.round(transcription.languageProb * 100)}%</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transcription ? (
                <div className={sameText ? '' : 'grid gap-6 md:grid-cols-2'}>
                  <section>
                    {!sameText && <h2 className="mb-2 text-sm font-medium text-muted-foreground">Original</h2>}
                    <p className="max-w-prose leading-relaxed whitespace-pre-wrap">{transcription.originalText}</p>
                  </section>
                  {!sameText && (
                    <section>
                      <h2 className="mb-2 text-sm font-medium text-muted-foreground">English</h2>
                      <p className="max-w-prose leading-relaxed whitespace-pre-wrap">{transcription.englishText}</p>
                    </section>
                  )}
                </div>
              ) : inProgress ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Spinner /> Transcribing. This page updates by itself.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">There is no transcript for this recording.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {analysis ? (
                <>
                  <p className="leading-snug">{analysis.summary}</p>
                  <ScoreMeter score={analysis.score} />
                  {analysis.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {sentenceCase(topic)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{inProgress ? 'Analysis appears once the transcript is ready.' : 'No analysis available.'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <Detail label="Language chosen">{feedback.languageHint ? languageName(feedback.languageHint) : 'Automatic'}</Detail>
                <Detail label="File">
                  {feedback.mimeType.replace('audio/', '')}, {formatSize(feedback.sizeBytes)}
                </Detail>
                <Detail label="Attempt">{feedback.attempt}</Detail>
                {transcription?.model && <Detail label="Speech model">{transcription.model}</Detail>}
                {analysis && <Detail label="Analysis model">{analysis.model}</Detail>}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
