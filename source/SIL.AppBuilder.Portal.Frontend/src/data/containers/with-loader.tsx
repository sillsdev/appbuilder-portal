import * as React from 'react';

import { PageLoader as Loader } from '@ui/components/loaders';

interface IOptions {
  wrapWith?: React.ComponentClass;
}

export function withLoader<TWrappedProps>(
  isLoading: (props: TWrappedProps) => boolean,
  options: IOptions = {}
) {
  const { wrapWith: Wrapper } = options;

  return WrappedComponent => {
    class LoadingWrapper extends React.Component<TWrappedProps> {
      render() {
        const isCurrentlyLoading = isLoading(this.props);

        if (isCurrentlyLoading) {
          if (Wrapper) {
            return <Wrapper><Loader /></Wrapper>;
          }

          return <Loader />;
        }

        return <WrappedComponent { ...this.props } />;
      }
    }

    return LoadingWrapper;
  };
}
