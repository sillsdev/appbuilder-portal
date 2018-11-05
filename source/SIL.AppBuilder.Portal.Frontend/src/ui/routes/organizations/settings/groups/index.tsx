import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';

import AddGroupForm from './add-group';
import List from './list';
import { withTranslations, i18nProps } from '@lib/i18n';
import { OrganizationResource } from '@data';

export const pathName = '/organizations/:orgId/settings/groups';

interface IOwnProps {
  organization: OrganizationResource;
}

interface IState {
  showAddGroupForm: boolean;
}

type IProps =
  & IOwnProps
  & i18nProps;

@withTemplateHelpers
class GroupsRoute extends React.Component<IProps, IState> {

  toggle: Toggle;
  state = { showAddGroupForm: false };

  render() {
    const { toggle } = this;
    const { t, organization } = this.props;
    const { showAddGroupForm } = this.state;

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.groupsTitle')}</h2>

        { !showAddGroupForm && (
          <Button
            className='tertiary uppercase large'
            onClick={toggle('showAddGroupForm')}>
            {t('org.addGroupButton')}
          </Button>
        ) }

        { showAddGroupForm && (
          <AddGroupForm onFinish={toggle('showAddGroupForm')} />
        ) }

        <List organization={organization}/>

      </div>
    );
  }
}

export default compose(
  withTranslations
)( GroupsRoute );
