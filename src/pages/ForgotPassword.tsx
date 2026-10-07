import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../lib/authClient'

const backToLogin = (
  <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
    Back to log in
  </Link>
)

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        description={`If an account exists for ${email}, we sent a link to reset the password.`}
        footer={backToLogin}
      >
        <p className="text-sm text-muted-foreground">The link expires after an hour.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" description="Enter your email and we will send you a reset link." footer={backToLogin}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Send reset link
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
