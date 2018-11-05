import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';

import Form from './form';
import List from './list';
import { withLoader, GroupResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withDataActions, IProvidedProps } from '@data/containers/resources/group/with-data-actions';

export const pathName = '/organizations/:orgId/settings/groups';

interface IOwnProps {
  groups: GroupResource[];
}

interface IState {
  showAddGroupForm: boolean;
}

type IProps =
  & IOwnProps
  & IProvidedProps
  & i18nProps;

@withTemplateHelpers
class GroupsRoute extends React.Component<IProps, IState> {

  toggle: Toggle;

  state = { showAddGroupForm: false };

  render() {
    const { toggle } = this;
    const { t, groups, createRecord, removeRecord } = this.props;
    const { showAddGroupForm } = this.state;

    const formProps = {
      createRecord,
      onFinish: toggle('showAddGroupForm')
    };

    const listProps = {
      removeRecord,
      groups
    }

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.groupsTitle')}</h2>

        { !showAddGroupForm && (
          <button
            className='ui button tertiary uppercase large'
            onClick={toggle('showAddGroupForm')}>
            {t('org.addGroupButton')}
          </button>
        ) }

        { showAddGroupForm && (
          <Form {...formProps} />
        ) }

        <List {...listProps} />
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(({ organization }) => ({
    groups: q => q.findRelatedRecords(organization, 'groups')
  })),
  withDataActions,
  withLoader(({ groups }) => !groups),
)( GroupsRoute );
