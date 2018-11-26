import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import List from './list';

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
        <List/>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(OrganizationRoute);