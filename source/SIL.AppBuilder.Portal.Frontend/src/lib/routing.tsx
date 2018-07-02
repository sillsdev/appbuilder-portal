import * as React from 'react';
import Layout from '@ui/components/layout';

export function withAuthLayout(Component) {
  return () => (
    <Layout>
      <Component />
    </Layout>
  );
}
