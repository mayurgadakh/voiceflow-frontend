import type { SentimentLabel, Status } from '../types'

const STATUS_LABELS: Record<Status, string> = {
  UPLOADING: 'Uploading',
  UPLOADED: 'Queued',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>
}

export function SentimentBadge({ label }: { label: SentimentLabel }) {
  return <span className={`badge sentiment-${label.toLowerCase()}`}>{label.charAt(0) + label.slice(1).toLowerCase()}</span>
}
