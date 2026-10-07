import type { Status } from '../types'

export const FINAL_STATUSES: Status[] = ['COMPLETED', 'FAILED', 'EXPIRED']

export const ERROR_MESSAGES: Record<string, string> = {
  NO_SPEECH: 'No speech was detected in the recording.',
  SPEECH_REJECTED: 'The speech service could not process the recording.',
  ANALYSIS_INVALID: 'The sentiment analysis returned an invalid result.',
  PROCESSING_FAILED: 'Processing failed after several attempts.',
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`
