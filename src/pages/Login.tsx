import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '../authClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await authClient.signIn.email({ email, password })
    if (error) setError(error.message ?? 'Login failed')
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Log in</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Log in</button>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        New here? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  )
}
