import * as React from 'react';
import { Redirect } from 'react-router-dom';
import * as toast from '@lib/toast';

import { hasRelationship } from '@data';

export function withAccessRestriction(WrappedComponent) {
  return (props) => {
    const { t, currentUser } = props;

    const hasGroups = hasRelationship(currentUser, 'groupMemberships');

    if (hasGroups) {
      return <WrappedComponent {...props} />;
    }

    toast.error(t('errors.groupRequired'));

    return <Redirect push={true} to={'/'} />;
  };
}
