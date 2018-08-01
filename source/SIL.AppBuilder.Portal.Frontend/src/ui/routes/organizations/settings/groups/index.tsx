import * as React from 'react';
import { match as Match } from 'react-router';
import { Button } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';

import AddGroupForm from './add-group';

export const pathName = '/organizations/:orgId/settings/groups';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  organization: any;
}

export interface IState {
  showAddGroupForm: boolean;
}

@withTemplateHelpers
class GroupsRoute extends React.Component<IProps & i18nProps, IState> {
  toggle: Toggle;
  state = { showAddGroupForm: false };

  render() {
    const { toggle } = this;
    const { match, t } = this.props;
    const { showAddGroupForm } = this.state;
    const { params: { orgId } } = match;

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.groupsTitle')}</h2>

        <p className='gray-text p-b-lg'>{t('org.noGroups')}</p>

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


      </div>
    );
  }
}

export default compose(
  translate('translations')
)( GroupsRoute );
