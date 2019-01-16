import * as React from 'react';
import { match as Match, Redirect } from 'react-router';
import { compose } from 'recompose';
import { translate, TransProps as i18nProps } from 'react-i18next';
import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';
import { pathName as notFoundPath } from '@ui/routes/errors/not-found';

export const pathName = '/invitations/missing-token';

export interface Params {
  token: string;
}

export interface IProps {
  match: Match<Params>;
}

class CreateOrganizationRoute extends React.Component<IProps & i18nProps> {
  render() {
    const { match, t } = this.props;
    const { params } = match;

    if (params.token && params.token !== '') {
      return <Redirect push={true} to={notFoundPath} />;
    }

    return (
      <div>
        <h1>{t('invitations.missingTokenTitle')}</h1>
        <p>{t('invitations.missingTokenPrompt')}</p>
      </div>
    );
  }
}

export default compose(
  requireAuth(),
  withLayout,
  translate('translations')
)(CreateOrganizationRoute);
