import type { Status } from '../types'

export const FINAL_STATUSES: Status[] = ['COMPLETED', 'FAILED', 'EXPIRED']

export const ERROR_MESSAGES: Record<string, string> = {
  NO_SPEECH: 'We could not hear any speech in the recording. Try again in a quieter place.',
  SPEECH_REJECTED: 'The recording could not be read by our speech service.',
  ANALYSIS_INVALID: 'The sentiment analysis returned an invalid result.',
  PROCESSING_FAILED: 'Processing failed after several attempts.',
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const formatDuration = (ms: number) => `${(ms / 1000).toFixed(1)}s`

export const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
