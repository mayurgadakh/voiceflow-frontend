import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '../components/PasswordInput'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '../components/AuthLayout'
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
    if (error) setError(error.message ?? 'Could not create the account')
    else setEmailSent(true)
  }

  if (emailSent) {
    return (
      <AuthLayout
        title="Check your email"
        description={`We sent a verification link to ${email}. Open it to finish creating your account.`}
        footer={
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to log in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">Can&apos;t find it? Check your spam folder.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Share feedback by voice, in your own language."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" autoComplete="name" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FieldDescription>At least 8 characters.</FieldDescription>
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Create account
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
