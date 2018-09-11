import * as React from 'react';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { attributesFor, PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { withCurrentUser } from '@data/containers/with-current-user';
import {
  withDataActions, IProvidedProps as IDataActionProps
} from '@data/containers/resources/project/with-data-actions';

import * as toast from '@lib/toast';


import GroupSelect from '@ui/components/inputs/group-select';
import UserSelect from '@ui/components/inputs/user-select';
import { ResourceObject } from 'jsonapi-typescript';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

type IProps =
  & Params
  & IDataActionProps
  & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { project, currentUser } = passedProps;
  const { type, id } = project;

  return {
    group: q => q.findRelatedRecord({ type, id }, 'group'),
    organization: q => q.findRelatedRecord({ type, id }, 'organization'),
    owner: q => q.findRelatedRecord({ type, id }, 'owner'),
  };
};


class Owners extends React.Component<IProps> {
  updateGroup = async (groupId) => {
    const { updateGroup, t } = this.props;

    try {
      await updateGroup(groupId);
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  }

  updateOwner = async (userId) => {
    const { updateOwner, t } = this.props;

    try {
      await updateOwner(userId);
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  }

  render() {
    const { t, project, group, organization, owner } = this.props;
    const { language, type } = attributesFor(project);
    const groupId = group.id;
    const organizationId = organization.id;
    const ownerId = owner.id;

    return (
      <div className='owner'>
        <div>
          <h4>{t('project.side.organization')}</h4>
          <div className='content'>
            <span>SIL International</span>
          </div>
        </div>
        <div>
          <h4>{t('project.side.projectOwner')}</h4>
          <div className='flex justify-content-space-around content'>
            <div className='flex-grow'>
              <UserSelect
                selected={ownerId}
                groupId={groupId}
                restrictToGroup={true}
                onChange={this.updateOwner} />
            </div>
          </div>
        </div>
        <div>
          <h4>{t('project.side.projectGroup')}</h4>

          <GroupSelect
            data-test-group-select
            scopeToCurrentUser={true}
            scopeToOrganization={organization}
            selected={groupId}
            onChange={this.updateGroup} />
        </div>
      </div>
    );

  }

}

export default compose(
  translate('translations'),
  withCurrentUser(),
  withOrbit(mapRecordsToProps),
  withDataActions
)(Owners);
