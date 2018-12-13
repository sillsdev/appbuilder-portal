import * as React from 'react';
import { compose, branch } from 'recompose';
import { Redirect } from 'react-router';

import * as toast from '@lib/toast';
import { withTranslations } from '@lib/i18n';

import { IProvidedProps } from './types';

export function requireOrganizationToBeSelected(InnerComponent) {
  return compose(
    withTranslations,
    branch(
      (props: IProvidedProps) => props.currentOrganizationId === '',
      () => ({ t }: any) => {
        toast.warning(t('errors.orgMustBeSelected'));

        return <Redirect to={'/'} push={true} />;
      }
    )
  )(InnerComponent);
}
