import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-screen">
          <section>
            <p>QuantEdge</p>
            <h1>Something went wrong</h1>
            <span>{this.state.error.message}</span>
            <button type="button" onClick={() => window.location.reload()}>Reload App</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

