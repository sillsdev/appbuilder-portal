import React, { useEffect } from 'react';

import { useRouter } from './hooks';

export function ScrollToTop({ children }) {
  const { location } = useRouter();

  useEffect(() => window.scrollTo(0, 0), [location]);

  return children;
}

export function withResetScroll(WrappedComponent) {
  return (props) => (
    <ScrollToTop>
      <WrappedComponent {...props} />
    </ScrollToTop>
  );
}
