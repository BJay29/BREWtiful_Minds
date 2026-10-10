import { Component } from 'react'

export default class SectionBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error(`Section "${this.props.name}" crashed:`, error)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-semibold">The "{this.props.name}" section failed to load.</p>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{String(error?.message || error)}</pre>
      </div>
    )
  }
}