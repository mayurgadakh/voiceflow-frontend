import { Link, useParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { BackLink } from '../components/BackLink'
import { StatusBadge } from '../components/Badges'
import { usePolledItem } from '../hooks/useApi'
import { ERROR_MESSAGES, FINAL_STATUSES, formatDate, formatDuration } from '../lib/format'
import { languageName } from '../lib/languages'
import type { MyFeedback } from '../types'

export default function FeedbackDetail() {
  const { id } = useParams()
  const { data: feedback, error } = usePolledItem<MyFeedback>(`/feedback/${id}`, FINAL_STATUSES)
  const transcription = feedback?.transcription
  const inProgress = feedback && !FINAL_STATUSES.includes(feedback.status)

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink to="/">My feedback</BackLink>

      {error && !feedback && (
        <Alert variant="destructive">
          <AlertTitle>Could not load this feedback</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feedback && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">Your feedback</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted {formatDate(feedback.createdAt)}, {formatDuration(feedback.durationMs)} long
                </p>
              </div>
              <StatusBadge status={feedback.status} />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {inProgress && (
              <div className="flex flex-col gap-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Spinner />
                  {feedback.status === 'UPLOADED' ? 'Your recording is queued.' : 'Transcribing your recording.'} This page updates by itself.
                </p>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}

            {feedback.status === 'COMPLETED' && transcription && (
              <>
                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-sm font-medium">What you said</h2>
                    <Badge variant="secondary">{languageName(transcription.languageCode)}</Badge>
                  </div>
                  <p className="max-w-prose leading-relaxed whitespace-pre-wrap">{transcription.originalText}</p>
                </section>
                {transcription.englishText !== transcription.originalText && (
                  <section>
                    <h2 className="mb-2 text-sm font-medium">In English</h2>
                    <p className="max-w-prose leading-relaxed whitespace-pre-wrap text-muted-foreground">{transcription.englishText}</p>
                  </section>
                )}
              </>
            )}

            {(feedback.status === 'FAILED' || feedback.status === 'EXPIRED') && (
              <Alert variant="destructive">
                <AlertTitle>We could not process this recording</AlertTitle>
                <AlertDescription>
                  <p>{(feedback.errorCode && ERROR_MESSAGES[feedback.errorCode]) || 'Something went wrong on our side.'}</p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/record">Record again</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
