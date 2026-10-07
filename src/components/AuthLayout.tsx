import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from './Logo'

type Props = { title: string; description?: string; children: ReactNode; footer?: ReactNode }

export function AuthLayout({ title, description, children, footer }: Props) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer && <p className="text-sm text-muted-foreground">{footer}</p>}
    </div>
  )
}
