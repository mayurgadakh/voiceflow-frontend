import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SentimentBadge, StatusBadge, UrgentBadge } from '../../components/Badges'
import { DateRangePicker } from '../../components/DateRangePicker'
import { PageHeader } from '../../components/PageHeader'
import { useCursorList } from '../../hooks/useApi'
import { formatDate, formatDuration } from '../../lib/format'
import { LANGUAGES, languageName } from '../../lib/languages'
import { SENTIMENT } from '../../lib/sentiment'
import type { AdminFeedbackRow, SentimentLabel, Status } from '../../types'

const ALL = 'all'
const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'UPLOADED', label: 'Queued' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'EXPIRED', label: 'Expired' },
]

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function FeedbackList() {
  const navigate = useNavigate()
  // Filters live in the URL, so the back button from a detail page keeps them
  const [params, setParams] = useSearchParams()
  const filters = {
    sentiment: params.get('sentiment') ?? '',
    status: params.get('status') ?? '',
    language: params.get('language') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  }
  const setFilter = (key: keyof typeof filters) => (value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  const hasFilters = Object.values(filters).some(Boolean)

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    // A date input gives a day, and "to" should include that whole day
    if (value) query.set(key, key === 'to' ? `${value}T23:59:59.999` : value)
  }
  const qs = query.toString()
  const { items, loading, error, hasMore, loadMore } = useCursorList<AdminFeedbackRow>(`/admin/feedback${qs ? `?${qs}` : ''}`)

  return (
    <>
      <PageHeader title="Feedback" description="Every voice note submitted by customers." />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Sentiment"
          value={filters.sentiment}
          onChange={setFilter('sentiment')}
          options={(Object.keys(SENTIMENT) as SentimentLabel[]).map((s) => ({ value: s, label: SENTIMENT[s].label }))}
        />
        <FilterSelect label="Status" value={filters.status} onChange={setFilter('status')} options={STATUS_OPTIONS} />
        <FilterSelect
          label="Language"
          value={filters.language}
          onChange={setFilter('language')}
          options={Object.entries(LANGUAGES).map(([value, label]) => ({ value, label }))}
        />
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Submitted</Label>
          <DateRangePicker
            from={filters.from}
            to={filters.to}
            onChange={(from, to) =>
              setParams(
                (prev) => {
                  const next = new URLSearchParams(prev)
                  if (from) next.set('from', from)
                  else next.delete('from')
                  if (to) next.set('to', to)
                  else next.delete('to')
                  return next
                },
                { replace: true },
              )
            }
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Customer</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="hidden lg:table-cell">Language</TableHead>
              <TableHead className="hidden lg:table-cell">Length</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/admin/feedback/${item.id}`)}>
                <TableCell className="pl-4">
                  <Link to={`/admin/feedback/${item.id}`} className="font-medium hover:underline">
                    {item.user.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{item.user.email}</div>
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  <span className="line-clamp-2">{item.transcription?.englishText ?? <span className="text-muted-foreground">No transcript yet</span>}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{languageName(item.transcription?.languageCode)}</TableCell>
                <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">{formatDuration(item.durationMs)}</TableCell>
                <TableCell>
                  {item.analysis ? (
                    <span className="flex items-center gap-1.5">
                      <SentimentBadge label={item.analysis.label} />
                      {item.analysis.urgent && <UrgentBadge />}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
              </TableRow>
            ))}
            {loading &&
              items.length === 0 &&
              Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-56" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="pr-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {!loading && !error && items.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{hasFilters ? 'No feedback matches these filters' : 'No feedback yet'}</EmptyTitle>
              <EmptyDescription>
                {hasFilters ? 'Try removing a filter or widening the date range.' : 'Voice notes appear here as soon as customers submit them.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {hasMore && (
          <div className="border-t p-3">
            <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
              Load more
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}
