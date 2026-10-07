import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SentimentBadge, StatusBadge } from '../../components/Badges'
import { useApi, useCursorList } from '../../hooks/useApi'
import { formatDate, formatDuration } from '../../lib/format'
import { LANGUAGES, languageName } from '../../lib/languages'
import type { AdminFeedbackRow, SentimentLabel, Stats, Status } from '../../types'

const SENTIMENTS: SentimentLabel[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']
const STATUSES: Status[] = ['COMPLETED', 'PROCESSING', 'UPLOADED', 'FAILED', 'EXPIRED']

function Bars({ rows, className }: { rows: { key: string; label: string; count: number; className?: string }[]; className?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (rows.length === 0) return <p className="muted">No data yet</p>
  return (
    <div className={className}>
      {rows.map((r) => (
        <div className="bar-row" key={r.key}>
          <span>{r.label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${r.className ?? ''}`} style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span>{r.count}</span>
        </div>
      ))}
    </div>
  )
}

function StatsSection() {
  const { data: stats, error } = useApi<Stats>('/admin/stats')
  if (error) return <p className="error">{error}</p>
  if (!stats) return <p className="muted">Loading stats...</p>

  const volumeMax = Math.max(1, ...stats.volume.map((v) => v.count))
  return (
    <>
      <div className="grid">
        <div className="panel">
          <div className="muted">Total feedback</div>
          <div className="stat">{stats.total}</div>
        </div>
        <div className="panel">
          <div className="muted">Urgent</div>
          <div className="stat">{stats.urgent}</div>
        </div>
        <div className="panel">
          <div className="muted">Failed</div>
          <div className="stat">{stats.byStatus.find((s) => s.status === 'FAILED')?.count ?? 0}</div>
        </div>
      </div>
      <div className="grid">
        <div className="panel">
          <h2>Sentiment</h2>
          <Bars
            rows={SENTIMENTS.map((label) => ({
              key: label,
              label: label.charAt(0) + label.slice(1).toLowerCase(),
              count: stats.bySentiment.find((s) => s.label === label)?.count ?? 0,
              className: `sentiment-${label.toLowerCase()}`,
            }))}
          />
        </div>
        <div className="panel">
          <h2>Top topics</h2>
          <Bars rows={stats.topics.map((t) => ({ key: t.topic, label: t.topic, count: t.count }))} />
        </div>
        <div className="panel">
          <h2>Languages</h2>
          <Bars rows={stats.byLanguage.map((l) => ({ key: l.language, label: languageName(l.language), count: l.count }))} />
        </div>
        <div className="panel">
          <h2>Last 30 days</h2>
          {stats.volume.length === 0 ? (
            <p className="muted">No data yet</p>
          ) : (
            <div className="volume">
              {stats.volume.map((v) => (
                <div key={v.day} title={`${v.day}: ${v.count}`} style={{ height: `${(v.count / volumeMax) * 100}%` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ sentiment: '', status: '', language: '', from: '', to: '' })

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue
    // The date inputs give a day, and "to" should include that whole day
    query.set(key, key === 'to' ? `${value}T23:59:59.999` : value)
  }
  const qs = query.toString()
  const { items, loading, error, hasMore, loadMore } = useCursorList<AdminFeedbackRow>(
    `/admin/feedback${qs ? `?${qs}` : ''}`,
  )

  const set = (key: keyof typeof filters) => (e: { target: { value: string } }) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }))

  return (
    <>
      <h1>Admin</h1>
      <StatsSection />

      <div className="panel">
        <h2>All feedback</h2>
        <div className="filters">
          <label>
            Sentiment
            <select value={filters.sentiment} onChange={set('sentiment')}>
              <option value="">All</option>
              {SENTIMENTS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filters.status} onChange={set('status')}>
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Language
            <select value={filters.language} onChange={set('language')}>
              <option value="">All</option>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input type="date" value={filters.from} onChange={set('from')} />
          </label>
          <label>
            To
            <input type="date" value={filters.to} onChange={set('to')} />
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="muted">No feedback matches these filters.</p>}
        {items.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Customer</th>
                  <th>Summary</th>
                  <th>Language</th>
                  <th>Length</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable" onClick={() => navigate(`/admin/feedback/${item.id}`)}>
                    <td>
                      <Link to={`/admin/feedback/${item.id}`}>{formatDate(item.createdAt)}</Link>
                    </td>
                    <td>{item.user.name}</td>
                    <td className="preview">{item.transcription?.englishText ?? '-'}</td>
                    <td>{languageName(item.transcription?.languageCode)}</td>
                    <td>{formatDuration(item.durationMs)}</td>
                    <td>
                      {item.analysis ? (
                        <>
                          <SentimentBadge label={item.analysis.label} />{' '}
                          {item.analysis.urgent && <span className="badge urgent">Urgent</span>}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loading && <p className="muted">Loading...</p>}
        {hasMore && !loading && <button onClick={loadMore}>Load more</button>}
      </div>
    </>
  )
}
