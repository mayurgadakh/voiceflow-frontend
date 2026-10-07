import type { SentimentLabel } from '../types'

export const SENTIMENT: Record<SentimentLabel, { label: string; dot: string; fill: string }> = {
  POSITIVE: { label: 'Positive', dot: 'bg-sentiment-positive', fill: 'var(--sentiment-positive)' },
  NEUTRAL: { label: 'Neutral', dot: 'bg-sentiment-neutral', fill: 'var(--sentiment-neutral)' },
  MIXED: { label: 'Mixed', dot: 'bg-sentiment-mixed', fill: 'var(--sentiment-mixed)' },
  NEGATIVE: { label: 'Negative', dot: 'bg-sentiment-negative', fill: 'var(--sentiment-negative)' },
}
