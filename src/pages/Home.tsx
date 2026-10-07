import { authClient } from '../lib/authClient'

export default function Home() {
  const { data: session } = authClient.useSession()
  const user = session?.user
  if (!user) return null

  return (
    <div className="card">
      <h1>Welcome, {user.name}</h1>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={() => authClient.signOut()}>Log out</button>
    </div>
  )
}
