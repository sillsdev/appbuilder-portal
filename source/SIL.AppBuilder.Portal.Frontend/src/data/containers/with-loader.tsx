import * as React from 'react';

import { PageLoader as Loader } from '@ui/components/loaders';

export function withLoader<TWrappedProps>(isLoading: (props: TWrappedProps) => boolean, Wrapper?: any) {
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
