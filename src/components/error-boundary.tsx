import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
import { View, Text, Pressable } from 'react-native'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component to catch and display runtime errors.
 * Prevents the entire app from crashing on unhandled errors.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-8">
          <Text className="text-3xl font-bold text-error mb-4">Something went wrong</Text>
          <Text className="text-base text-text-secondary dark:text-dark-text-secondary text-center mb-6">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="bg-primary px-6 py-3 rounded-lg active:bg-primary-dark"
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}
