import { Link, NavLink, Outlet } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function AppLayout() {
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user.role === 'admin'

  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">
          Voice Feedback
        </Link>
        <nav>
          {isAdmin ? (
            <NavLink to="/admin">Dashboard</NavLink>
          ) : (
            <>
              <NavLink to="/" end>
                My feedback
              </NavLink>
              <NavLink to="/record">Record</NavLink>
            </>
          )}
        </nav>
        <span className="spacer" />
        <span className="muted">{session?.user.name}</span>
        <button onClick={() => authClient.signOut()}>Log out</button>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
