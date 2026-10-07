import { Component } from 'react'
import type { ReactNode } from 'react'

type State = { hasError: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="card">
        <h1>Something went wrong</h1>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }
}
