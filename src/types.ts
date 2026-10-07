export type Status = 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED'

export type Transcription = {
  originalText: string
  englishText: string
  languageCode: string | null
  languageProb?: number | null
  model?: string
}

export type Analysis = {
  label: SentimentLabel
  score: number
  summary: string
  topics: string[]
  urgent: boolean
  model: string
}

// What a customer sees: no sentiment
export type MyFeedback = {
  id: string
  status: Status
  durationMs: number
  errorCode: string | null
  createdAt: string
  completedAt: string | null
  transcription: Transcription | null
}

export type AdminFeedbackRow = {
  id: string
  status: Status
  errorCode: string | null
  durationMs: number
  createdAt: string
  user: { name: string; email: string }
  transcription: { englishText: string; languageCode: string | null } | null
  analysis: { label: SentimentLabel; score: number; urgent: boolean } | null
}

export type AdminFeedback = MyFeedback & {
  user: { name: string; email: string }
  mimeType: string
  sizeBytes: number
  languageHint: string | null
  attempt: number
  transcription: Transcription | null
  analysis: Analysis | null
}

export type Stats = {
  total: number
  urgent: number
  byStatus: { status: Status; count: number }[]
  bySentiment: { label: SentimentLabel; count: number }[]
  byLanguage: { language: string; count: number }[]
  volume: { day: string; count: number }[]
  topics: { topic: string; count: number }[]
}

export type Page<T> = { items: T[]; nextCursor: string | null }
