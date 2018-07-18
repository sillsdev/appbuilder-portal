export function withFiltering(WrappedComponent) {
  return props => <WrappedComponent { ...props } />
}
