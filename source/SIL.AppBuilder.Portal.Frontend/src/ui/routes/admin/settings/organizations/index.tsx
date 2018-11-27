import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import List from './list';
import AddNewOrganizationForm from './form';

import { Switch, Route } from 'react-router-dom';

export const listPathName = '/admin/settings/organizations';
export const formPathName = '/admin/settings/organizations/new';

type IProps =
  & i18nProps;

class OrganizationRoute extends React.Component<IProps> {

  render() {

    const {t} = this.props;

    return (
      <div className='sub-page-content' data-test-admin-organizations>
        <h2 className='sub-page-heading'>
          {t('admin.settings.organizations.title')}
        </h2>
        <Switch>
          <Route exact path={listPathName} render={(routeProps) => (
            <List {...routeProps} />
          )} />
          <Route path={formPathName} render={(routeProps) => (
            <AddNewOrganizationForm {...routeProps} />
          )} />
        </Switch>

      </div>
    );
  }
}

export default compose(
  withTranslations
)(OrganizationRoute);