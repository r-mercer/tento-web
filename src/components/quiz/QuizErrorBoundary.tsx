import { Component, type ReactNode, type ErrorInfo } from "react";
import { MessageBar, MessageBarBody, Button, Title2, Body1 } from "@fluentui/react-components";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QuizErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Quiz error boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <MessageBar intent="error" style={{ marginBottom: "1.5rem" }}>
            <MessageBarBody>
              <Title2 style={{ marginBottom: "0.5rem" }}>Something went wrong</Title2>
              <Body1>
                {this.state.error?.message || "An unexpected error occurred while loading the quiz."}
              </Body1>
            </MessageBarBody>
          </MessageBar>
          <Button appearance="primary" onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
