import * as React from 'react';

import { ROLE } from '@data/models/role';
import { withRole, IOptions } from '@data/containers/with-role';

interface IRequireRoleProps {
  roleName: ROLE,
  render?: any;
  children?: any;
}

/**
 * By default, this will render nothing upon a failed authorization check
 *
 * all the normal withRole options are available, so redirecting, or
 * rendering alternative components are possible
 */
export function RequireRole(props: IRequireRoleProps & IOptions<{}>) {
  const { roleName, render, children, ...options  } = props;
  const ComponentToRender = render || (() => children);
  const ComponentWithRoleRequirement = withRole(roleName, options)(ComponentToRender);

  return <ComponentWithRoleRequirement />;
}

