import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '../../lib/error-reporting'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void reportError(error, { componentStack: errorInfo.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="field-error" role="alert">
          Une erreur inattendue est survenue.
        </p>
      )
    }
    return this.props.children
  }
}
