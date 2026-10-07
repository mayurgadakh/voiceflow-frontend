import { Mic } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { useCursorList } from '../hooks/useApi'
import { formatDate, formatDuration } from '../lib/format'
import { languageName } from '../lib/languages'
import type { MyFeedback } from '../types'

function RecordButton() {
  return (
    <Button asChild>
      <Link to="/record">
        <Mic /> Record feedback
      </Link>
    </Button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { items, loading, error, hasMore, loadMore } = useCursorList<MyFeedback>('/feedback')
  const empty = !loading && !error && items.length === 0

  return (
    <>
      <PageHeader title="My feedback" description="The voice notes you have submitted." actions={items.length > 0 ? <RecordButton /> : undefined} />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {empty ? (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Mic />
              </EmptyMedia>
              <EmptyTitle>No feedback yet</EmptyTitle>
              <EmptyDescription>Record a short voice note about your experience. It takes under a minute.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <RecordButton />
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">What you said</TableHead>
                <TableHead className="hidden sm:table-cell">Length</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pr-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/feedback/${item.id}`)}>
                  <TableCell className="max-w-xs pl-4 whitespace-normal">
                    <Link to={`/feedback/${item.id}`} className="line-clamp-2 font-medium hover:underline">
                      {item.transcription?.englishText ?? (
                        <span className="font-normal text-muted-foreground">
                          {item.status === 'FAILED' || item.status === 'EXPIRED' ? 'Could not be processed' : 'Waiting for transcript'}
                        </span>
                      )}
                    </Link>
                    {item.transcription?.languageCode && (
                      <span className="text-xs text-muted-foreground">{languageName(item.transcription.languageCode)}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">{formatDuration(item.durationMs)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="pr-4">
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
              {loading &&
                items.length === 0 &&
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-4">
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="pr-4">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {hasMore && (
            <div className="border-t p-3">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                Load more
              </Button>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
