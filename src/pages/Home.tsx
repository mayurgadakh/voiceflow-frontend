import { authClient } from '../authClient'

type Props = { user: { name: string; email: string; role?: string | null } }

export default function Home({ user }: Props) {
  return (
    <div className="card">
      <h1>Welcome, {user.name}</h1>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={() => authClient.signOut()}>Log out</button>
    </div>
  )
}
