import * as React from 'react';
import { match as Match, withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import ResponsiveNav from '@ui/components/semantic-extensions/responsive-sub-navigation';

import { profilePath, rolesPath, groupsPath } from '../routes';

import { withTranslations } from '~/lib/i18n';

export interface Params {
  userId: string;
}

export type IProps = { match: Match<Params> } & RouteComponentProps<{}> & i18nProps;

class Navigation extends React.Component<IProps> {
  render() {
    const { match, t } = this.props;
    const {
      params: { userId },
    } = match;

    return (
      <ResponsiveNav
        items={[
          { to: profilePath.replace(/:userId/, userId), text: t('users.userProfile') },
          { to: rolesPath.replace(/:userId/, userId), text: t('users.userRoles') },
          { to: groupsPath.replace(/:userId/, userId), text: t('users.userGroups') },
        ]}
      />
    );
  }
}

export default compose(
  withRouter,
  withTranslations
)(Navigation);
