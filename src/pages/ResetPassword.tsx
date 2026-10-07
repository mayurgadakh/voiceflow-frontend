import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { PasswordInput } from '../components/PasswordInput'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../lib/authClient'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword, token })
    setLoading(false)
    if (error) setError(error.message ?? 'Could not reset the password')
    else navigate('/login')
  }

  if (!token) {
    return (
      <AuthLayout
        title="This link has expired"
        description="Reset links work once and expire after an hour. Request a new one to continue."
        footer={
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to log in
          </Link>
        }
      >
        <Button asChild size="lg" className="w-full">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" description="Choose a password you have not used here before.">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <PasswordInput
              id="new-password"
              placeholder="Choose a new password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FieldDescription>At least 8 characters.</FieldDescription>
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Update password
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
