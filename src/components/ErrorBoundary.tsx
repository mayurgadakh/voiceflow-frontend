import { Component } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

type State = { hasError: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription>The page hit an unexpected error. Reloading usually fixes it.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }
}
