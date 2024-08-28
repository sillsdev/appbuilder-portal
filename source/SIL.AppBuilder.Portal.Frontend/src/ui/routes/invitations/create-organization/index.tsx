import * as React from 'react';
import { match as Match } from 'react-router';
import { TransProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import CreateOrganizationForm from './form';

import { withTranslations } from '~/lib/i18n';

export const pathName = '/invitations/organization/:token';

export interface Params {
  token: string;
}

export interface IProps {
  match: Match<Params>;
}

class CreateOrganizationRoute extends React.Component<IProps & i18nProps> {
  render() {
    const { match, t } = this.props;
    const {
      params: { token },
    } = match;

    return (
      <div className='ui container'>
        <div className='ui centered column grid'>
          <div className='eight wide column '>
            <h2 className='page-heading'>{t('invitations.orgInviteTitle')}</h2>

            <CreateOrganizationForm token={token} />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(requireAuth(), withLayout, withTranslations)(CreateOrganizationRoute);
