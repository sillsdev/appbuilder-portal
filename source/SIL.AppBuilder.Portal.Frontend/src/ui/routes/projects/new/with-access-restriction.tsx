import * as React from 'react';
import { Redirect } from 'react-router-dom';
import * as toast from '@lib/toast';

import { hasRelationship } from '@data';

import { useTranslations } from '~/lib/i18n';

import { useCurrentUser } from '~/data/containers/with-current-user';

export function withAccessRestriction(WrappedComponent) {
  return function NewProjectAccessCheck(props) {
    const { t } = useTranslations();
    const { currentUser } = useCurrentUser();

    const hasGroups = hasRelationship(currentUser, 'groupMemberships');

    if (hasGroups) {
      return <WrappedComponent {...props} />;
    }

    toast.error(t('errors.groupRequired'));

    return <Redirect push={true} to={'/'} />;
  };
}
