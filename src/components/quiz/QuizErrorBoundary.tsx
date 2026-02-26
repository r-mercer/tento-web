import { Component, type ReactNode, type ErrorInfo } from "react";
import {
  Body1,
  Button,
  MessageBar,
  MessageBarBody,
  Title2,
} from "@fluentui/react-components";
import styles from "./QuizErrorBoundary.module.css";

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
        <div className={styles.container}>
          <MessageBar intent="error" className={styles.message}>
            <MessageBarBody>
              <Title2 className={styles.title}>Something went wrong</Title2>
              <Body1>
                {this.state.error?.message ||
                  "An unexpected error occurred while loading the quiz."}
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
