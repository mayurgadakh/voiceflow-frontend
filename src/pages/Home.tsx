import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '../components/Badges'
import { useCursorList } from '../hooks/useApi'
import { formatDate, formatDuration } from '../lib/format'
import type { MyFeedback } from '../types'

export default function Home() {
  const navigate = useNavigate()
  const { items, loading, error, hasMore, loadMore } = useCursorList<MyFeedback>('/feedback')

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>My feedback</h1>
        <Link to="/record">
          <button>Record feedback</button>
        </Link>
      </div>

      <div className="panel table-wrap">
        {error && <p className="error">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="muted">Nothing yet. Record your first feedback.</p>}
        {items.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Length</th>
                <th>What we heard</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="clickable" onClick={() => navigate(`/feedback/${item.id}`)}>
                  <td>
                    <Link to={`/feedback/${item.id}`}>{formatDate(item.createdAt)}</Link>
                  </td>
                  <td>{formatDuration(item.durationMs)}</td>
                  <td className="preview">{item.transcription?.englishText ?? '-'}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {loading && <p className="muted">Loading...</p>}
        {hasMore && !loading && <button onClick={loadMore}>Load more</button>}
      </div>
    </>
  )
}
