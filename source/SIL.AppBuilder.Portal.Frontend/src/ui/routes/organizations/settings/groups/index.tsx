import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { compareVia } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import {
  withDataActions,
  IProvidedProps,
} from '@data/containers/resources/group/with-data-actions';
import { Toggle, toggleCreator } from 'react-state-helpers';

import Form from './form';
import List from './list';

import { withLoader, GroupResource, attributesFor } from '@data';

export const pathName = '/organizations/:orgId/settings/groups';

interface IOwnProps {
  groups: GroupResource[];
}

interface IState {
  showForm: boolean;
  groupToEdit: GroupResource;
}

type IProps = IOwnProps & IProvidedProps & i18nProps;

class GroupsRoute extends React.Component<IProps, IState> {
  toggle: Toggle;

  state = {
    showForm: false,
    groupToEdit: null,
  };

  constructor(props) {
    super(props);

    this.toggle = toggleCreator(this);
  }

  setGroupToEdit = (group) => {
    this.setState({
      groupToEdit: group,
      showForm: true,
    });
  };

  render() {
    const { toggle } = this;
    const { t, groups, createRecord, updateAttributes, removeRecord } = this.props;
    const { showForm, groupToEdit } = this.state;

    const formProps = {
      groupToEdit,
      createRecord,
      updateAttributes,
      onFinish: () => {
        this.setState({
          showForm: false,
          groupToEdit: null,
        });
      },
    };

    const listProps = {
      removeRecord,
      setGroupToEdit: this.setGroupToEdit,
      groups,
    };

    return (
      <div className='sub-page-content' data-test-org-groups>
        <h2 className='sub-page-heading'>{t('org.groupsTitle')}</h2>

        {!showForm && (
          <button
            data-test-org-add-group-button
            className='ui button tertiary uppercase large'
            onClick={toggle('showForm')}
          >
            {t('org.addGroupButton')}
          </button>
        )}

        {showForm && <Form {...formProps} />}

        <List {...listProps} />
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(({ organization }) => ({
    groups: (q) => q.findRelatedRecords(organization, 'groups'),
  })),
  withDataActions,
  withLoader(({ groups }) => !groups),
  withProps(({ groups }) => ({
    groups: groups.sort(compareVia((group) => attributesFor(group).name.toLowerCase())),
  }))
)(GroupsRoute);
