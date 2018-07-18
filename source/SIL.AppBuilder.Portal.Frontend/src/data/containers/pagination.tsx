export function withPagination(WrappedComponent) {
  return props => <WrappedComponent { ...props } />;
}
