import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '../authClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="card">
        <h1>Check your email</h1>
        <p>If an account exists for {email}, we sent a reset link.</p>
        <Link to="/login">Back to login</Link>
      </div>
    )
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Forgot password</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Send reset link</button>
      <Link to="/login">Back to login</Link>
    </form>
  )
}
