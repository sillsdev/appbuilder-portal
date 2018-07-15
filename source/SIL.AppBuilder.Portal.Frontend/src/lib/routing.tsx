import * as React from 'react';
import Layout from '@ui/components/layout';
import { withCurrentUser } from '@data/with-current-user';


export function withAuthLayout(Component) {
  return (props) => (
    <Layout>
      <Component {...props} />
    </Layout>
  );
}
