import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '../components/PasswordInput'
import { Spinner } from '@/components/ui/spinner'
import { AuthLayout } from '../components/AuthLayout'
import { authClient } from '../lib/authClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) setError(error.message ?? 'Could not log in')
  }

  return (
    <AuthLayout
      title="Log in"
      description="Use the email and password you signed up with."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link to="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Log in
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
