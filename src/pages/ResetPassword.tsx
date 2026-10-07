import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await authClient.resetPassword({ newPassword, token: token! })
    if (error) setError(error.message ?? 'Could not reset password')
    else navigate('/login')
  }

  if (!token) {
    return (
      <div className="card">
        <p>This reset link is invalid or has expired.</p>
        <Link to="/forgot-password">Request a new one</Link>
      </div>
    )
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Set a new password</h1>
      <input
        type="password"
        placeholder="New password (min 8 characters)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={8}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Reset password</button>
    </form>
  )
}
