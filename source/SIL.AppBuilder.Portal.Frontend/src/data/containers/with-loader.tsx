import * as React from 'react';
import { PageLoader, RectLoader } from '@ui/components/loaders';

interface IOptions {
  wrapWith?: React.ComponentClass;
  forPage?: boolean;
}

export function withLoader<TWrappedProps>(
  isLoading: (props: TWrappedProps) => boolean,
  options: IOptions = {}
) {
  const { wrapWith: Wrapper, forPage } = options;
  const Loader = forPage ? PageLoader : RectLoader;

  return (WrappedComponent) => {
    class LoadingWrapper extends React.Component<TWrappedProps> {
      render() {
        const isCurrentlyLoading = isLoading(this.props);

        if (isCurrentlyLoading) {
          if (Wrapper) {
            return (
              <Wrapper>
                <Loader />
              </Wrapper>
            );
          }

          return <Loader />;
        }

        return <WrappedComponent {...this.props} />;
      }
    }

    return LoadingWrapper;
  };
}
