import React, { ErrorInfo } from "react";

type Props = {
  renderErrors(errors: Error[]): React.ReactNode;
};

type State =
  | {
      hasError: true;
      errors: Error[];
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
    return { hasError: true, errors: [error] };
  }

  render() {
    if (this.state.hasError) {
      return this.props.renderErrors(this.state.errors);
    }

    return this.props.children;
  }
}
