import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SENTIMENT } from '../lib/sentiment'
import type { SentimentLabel, Status } from '../types'

function Dot({ className }: { className: string }) {
  return <span className={cn('size-1.5 rounded-full', className)} aria-hidden="true" />
}

const STATUS: Record<Status, { label: string; dot: string }> = {
  UPLOADING: { label: 'Uploading', dot: 'bg-sentiment-neutral' },
  UPLOADED: { label: 'Queued', dot: 'bg-sentiment-mixed' },
  PROCESSING: { label: 'Processing', dot: 'bg-sentiment-mixed animate-pulse' },
  COMPLETED: { label: 'Completed', dot: 'bg-sentiment-positive' },
  FAILED: { label: 'Failed', dot: 'bg-sentiment-negative' },
  EXPIRED: { label: 'Expired', dot: 'bg-sentiment-neutral' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, dot } = STATUS[status]
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <Dot className={dot} />
      {label}
    </Badge>
  )
}

export function SentimentBadge({ label }: { label: SentimentLabel }) {
  const { label: text, dot } = SENTIMENT[label]
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <Dot className={dot} />
      {text}
    </Badge>
  )
}

export function UrgentBadge() {
  return <Badge variant="destructive">Urgent</Badge>
}
