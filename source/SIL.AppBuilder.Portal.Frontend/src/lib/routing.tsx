import * as React from 'react';
import { withLayout } from '@ui/components/layout';

export function withAuthLayout(Component) {
  console.warn(`
    [DEPRECATED]: use withLayout from @ui/components/layout instead of withAuthLayout
  `);

  return withLayout(Component);
}
