import * as React from 'react';
import { Redirect } from 'react-router-dom';
import * as toast from '@lib/toast';

import { hasRelationship } from '@data';

import { useTranslations } from '~/lib/i18n';

import { useCurrentOrganization } from '@data/containers/with-current-organization';

import { useCurrentUser } from '~/data/containers/with-current-user';

export function withAccessRestriction(WrappedComponent) {
  return function NewProjectAccessCheck(props) {
    const { t } = useTranslations();
    const { currentUser } = useCurrentUser();
    const { currentOrganizationId } = useCurrentOrganization();

    const hasGroups = hasRelationship(currentUser, 'groupMemberships');

    if (!hasGroups) {
      toast.error(t('errors.groupRequired'));
      return <Redirect push={true} to={'/'} />;
    }
    if (currentOrganizationId === '') {
      toast.error(t('errors.orgMustBeSelected'));
      return <Redirect push={true} to={'/'} />;
    }

    return <WrappedComponent {...props} />;
  };
}
