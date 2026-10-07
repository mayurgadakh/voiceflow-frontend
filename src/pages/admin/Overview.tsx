import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '../../components/PageHeader'
import { SENTIMENT } from '../../lib/sentiment'
import { useApi } from '../../hooks/useApi'
import { sentenceCase } from '../../lib/format'
import { languageName } from '../../lib/languages'
import type { SentimentLabel, Stats } from '../../types'

const SENTIMENT_ORDER: SentimentLabel[] = ['POSITIVE', 'NEUTRAL', 'MIXED', 'NEGATIVE']
const DAYS = 30
const volumeConfig = { count: { label: 'Feedback', color: 'var(--chart-1)' } } satisfies ChartConfig

function Figure({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        {dot && <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />}
        {label}
      </dt>
      <dd className="text-3xl font-semibold tracking-tight tabular-nums">{value}</dd>
    </div>
  )
}

function RankedList({ rows }: { rows: { key: string; label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nothing to show until feedback has been analysed.</p>
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span>{sentenceCase(row.label)}</span>
            <span className="text-muted-foreground tabular-nums">{row.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// The API only returns days that have feedback, so fill the gaps to keep the time axis honest
function lastDays(volume: Stats['volume']) {
  const counts = new Map(volume.map((v) => [v.day.slice(0, 10), v.count]))
  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (DAYS - 1 - i))
    return {
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: counts.get(date.toLocaleDateString('en-CA')) ?? 0,
    }
  })
}

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-1" />
        <Skeleton className="h-64 lg:col-span-2" />
      </div>
    </div>
  )
}

export default function Overview() {
  const { data: stats, error } = useApi<Stats>('/admin/stats')

  const count = (status: string) => stats?.byStatus.find((s) => s.status === status)?.count ?? 0
  const analysed = stats?.bySentiment.reduce((sum, s) => sum + s.count, 0) ?? 0

  return (
    <>
      <PageHeader
        title="Overview"
        description="How customers feel, and what they talk about."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/feedback">View all feedback</Link>
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!stats && !error && <Loading />}

      {stats && (
        <div className="flex flex-col gap-4">
          <Card className="p-0">
            <dl className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
              <Figure label="Received" value={stats.total} />
              <Figure label="Analysed" value={count('COMPLETED')} dot="bg-sentiment-positive" />
              <Figure label="Urgent" value={stats.urgent} dot="bg-sentiment-negative" />
              <Figure label="Failed" value={count('FAILED')} dot="bg-sentiment-negative" />
            </dl>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment</CardTitle>
                <CardDescription>Across {analysed} analysed {analysed === 1 ? 'recording' : 'recordings'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {analysed === 0 ? (
                  <p className="text-sm text-muted-foreground">No analysed feedback yet.</p>
                ) : (
                  <>
                    <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Sentiment split">
                      {SENTIMENT_ORDER.map((label) => {
                        const n = stats.bySentiment.find((s) => s.label === label)?.count ?? 0
                        return n > 0 ? <div key={label} style={{ width: `${(n / analysed) * 100}%`, background: SENTIMENT[label].fill }} /> : null
                      })}
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {SENTIMENT_ORDER.map((label) => {
                        const n = stats.bySentiment.find((s) => s.label === label)?.count ?? 0
                        return (
                          <li key={label} className="flex items-center gap-2 text-sm">
                            <span className={`size-2 rounded-full ${SENTIMENT[label].dot}`} aria-hidden="true" />
                            {SENTIMENT[label].label}
                            <span className="ml-auto text-muted-foreground tabular-nums">
                              {n} <span className="inline-block w-10 text-right">{Math.round((n / analysed) * 100)}%</span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Feedback per day</CardTitle>
                <CardDescription>Last {DAYS} days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={volumeConfig} className="h-52 w-full">
                  <BarChart data={lastDays(stats.volume)} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={32} />
                    <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={3} isAnimationActive={false} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
                <CardDescription>What customers mention most</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedList rows={stats.topics.map((t) => ({ key: t.topic, label: t.topic, count: t.count }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>What customers speak</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedList rows={stats.byLanguage.map((l) => ({ key: l.language, label: languageName(l.language), count: l.count }))} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
