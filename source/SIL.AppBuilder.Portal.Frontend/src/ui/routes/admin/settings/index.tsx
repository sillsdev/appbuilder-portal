import * as React from 'react';
import { compose } from 'recompose';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withLayout } from '@ui/components/layout';
import Navigation from './navigation';
import { Switch, Route } from 'react-router-dom';
import OrganizationsRoute from '@ui/routes/admin/settings/organizations';

export const pathName = '/admin/settings';

type IProps =
  & i18nProps;

class AdminSettingsRoute extends React.Component<IProps> {

  render() {

    const { t } = this.props;

    return (
      <div className='ui container'>
        <h2 className='page-heading page-heading-border-sm'>
          {t('admin.settings.title')}
        </h2>
        <div className='flex-column-xs flex-row-sm align-items-start-sm'>
          <Navigation/>
          <div className='m-l-lg flex-grow'>
            <Switch>
              <Route path={pathName} component={OrganizationsRoute} />
            </Switch>
          </div>
        </div>
      </div>
    );

  }

}

export default compose(
  withLayout,
  withTranslations,
)(AdminSettingsRoute);