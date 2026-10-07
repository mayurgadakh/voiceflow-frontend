import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await authClient.signUp.email({ name, email, password, callbackURL: window.location.origin })
    setLoading(false)
    if (error) setError(error.message ?? 'Signup failed')
    else setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="card">
        <h1>Check your email</h1>
        <p>We sent a verification link to {email}. Click it to finish signing up.</p>
      </div>
    )
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Sign up</h1>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>Create account</button>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  )
}
