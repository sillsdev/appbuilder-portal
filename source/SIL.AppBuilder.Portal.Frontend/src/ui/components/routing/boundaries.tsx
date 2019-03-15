import { useMemo } from 'react';

import { useRouter } from '~/lib/hooks';

export function RouteBoundary({ paths, children }) {
  const { history } = useRouter();
  const { pathname } = history.location;

  const isMatch = useMemo(
    () => paths.filter((root) => new RegExp(`^${root}`).test(pathname)).length > 0,
    [pathname]
  );

  if (isMatch) {
    return children;
  }

  return null;
}
