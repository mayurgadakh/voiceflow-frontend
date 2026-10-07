import { Mic, RotateCcw, Square } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { AudioPlayer } from '../components/AudioPlayer'
import { LevelMeter } from '../components/LevelMeter'
import { MAX_SECONDS, useRecorder } from '../hooks/useRecorder'
import { api } from '../lib/api'
import { LANGUAGES } from '../lib/languages'

const AUTO = 'auto'
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function Record() {
  const { isRecording, seconds, recording, error: recorderError, analyser, start, stop, discard } = useRecorder()
  const [language, setLanguage] = useState(AUTO)
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
          languageHint: language === AUTO ? undefined : language,
        },
      })
      // Audio goes straight to storage, never through our API
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': recording.mimeType.split(';')[0] },
        body: recording.blob,
      })
      if (!upload.ok) throw new Error('The upload failed. Check your connection and try again.')
      await api(`/feedback/${id}/complete`, { method: 'POST' })
      navigate(`/feedback/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  const reviewing = recording !== null && !isRecording

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">Record feedback</CardTitle>
          <CardDescription>Tell us about your experience in up to {MAX_SECONDS} seconds.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="language">Language you will speak</FieldLabel>
            <Select value={language} onValueChange={setLanguage} disabled={isRecording || submitting}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO}>Detect automatically</SelectItem>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Pick a language if you know it. Automatic detection can struggle with mixed languages.</FieldDescription>
          </Field>

          {reviewing ? (
            <div className="flex flex-col gap-2">
              <AudioPlayer key={recording.url} src={recording.url} durationMs={recording.durationMs} label="your recording" />
              <Button type="button" variant="ghost" size="sm" className="self-start" onClick={discard} disabled={submitting}>
                <RotateCcw /> Record again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 rounded-lg border bg-muted/40 px-4 py-6">
              <LevelMeter analyser={analyser} />
              <p className="text-3xl font-medium tabular-nums" aria-live="off">
                {clock(seconds)}
                <span className="text-base font-normal text-muted-foreground"> / {clock(MAX_SECONDS)}</span>
              </p>
              <button
                type="button"
                onClick={isRecording ? stop : start}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                className={
                  isRecording
                    ? 'flex size-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground ring-4 ring-destructive/25 outline-none transition focus-visible:ring-8'
                    : 'flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring/50'
                }
              >
                {isRecording ? <Square className="size-5 fill-current" /> : <Mic className="size-6" />}
              </button>
              <p className="text-sm text-muted-foreground" role="status">
                {isRecording ? 'Recording. Press to stop.' : 'Press to start recording.'}
              </p>
            </div>
          )}

          {reviewing && (
            <Field orientation="horizontal">
              <Checkbox id="consent" checked={consent} onCheckedChange={(value) => setConsent(value === true)} />
              <FieldLabel htmlFor="consent" className="font-normal leading-snug">
                I agree that my recording is processed by speech-to-text and AI services to transcribe and analyse my feedback.
              </FieldLabel>
            </Field>
          )}

          {(recorderError || error) && (
            <Alert variant="destructive">
              <AlertDescription>{recorderError || error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        {reviewing && (
          <CardFooter>
            <Button type="submit" size="lg" className="w-full" disabled={!consent || submitting}>
              {submitting && <Spinner />}
              {submitting ? 'Submitting' : 'Submit feedback'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  )
}
