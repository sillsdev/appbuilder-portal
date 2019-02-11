import * as React from 'react';
import { match as Match, withRouter, RouteComponentProps } from 'react-router';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps, withTranslation } from 'react-i18next';
import ResponsiveNav from '@ui/components/semantic-extensions/responsive-sub-navigation';

import {
  infoPath,
  userPath,
  productsPath,
  storesPath,
  groupsPath,
  infrastructurePath,
} from '../routes';

import { withTranslations } from '~/lib/i18n';

export interface Params {
  orgId: string;
}

export type IProps = { match: Match<Params> } & RouteComponentProps<{}> & i18nProps;

class Navigation extends React.Component<IProps> {
  render() {
    const { match, t } = this.props;
    const {
      params: { orgId },
    } = match;

    return (
      <ResponsiveNav
        items={[
          { to: infoPath.replace(/:orgId/, orgId), text: t('org.navBasic') },
          { to: productsPath.replace(/:orgId/, orgId), text: t('org.navProducts') },
          { to: storesPath.replace(/:orgId/, orgId), text: t('org.navStores') },
          { to: groupsPath.replace(/:orgId/, orgId), text: t('org.navGroups') },
          { to: infrastructurePath.replace(/:orgId/, orgId), text: t('org.navInfrastructure') },
        ]}
      />
    );
  }
}

export default compose(
  withRouter,
  withTranslations
)(Navigation);
