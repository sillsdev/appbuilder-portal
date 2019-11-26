import * as React from 'react';
import { branch } from 'recompose';
import { Redirect } from 'react-router';
import * as toast from '@lib/toast';
import { useTranslations } from '@lib/i18n';

import { IProvidedProps } from './types';

export function requireOrganizationToBeSelected(InnerComponent) {
  return branch(
    (props: IProvidedProps) => props.currentOrganizationId == '',
    () =>
      function RequireOrganizationToBeSelected() {
        const { t } = useTranslations();

        toast.warning(t('errors.orgMustBeSelected'));

        return <Redirect to={'/'} push={true} />;
      }
  )(InnerComponent);
}
