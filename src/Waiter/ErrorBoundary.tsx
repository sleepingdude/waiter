import React, { ErrorInfo } from "react";

type Props = {
  renderError(errors: Error | null): React.ReactNode;
};

type State =
  | {
      hasError: true;
      error: Error;
    }
  | {
      hasError: false;
    };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.renderError(this.state.error);
    }

    return this.props.children;
  }
}
