import * as React from 'react';

import PageError from './page';

interface IState {
  error?: any;
  hasError?: Error | any;
}

// https://reactjs.org/docs/error-boundaries.html
export default class ErrorBoundary extends React.Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.error(error, info);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return <PageError error={error} />;
    }

    return this.props.children;
  }
}
