import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { attributesFor, ProjectResource } from '@data';

import {
  withDataActions,
  IProvidedProps as IDataActionProps,
} from '@data/containers/resources/project/with-data-actions';
import * as toast from '@lib/toast';
import { i18nProps, withTranslations } from '@lib/i18n';
import GroupSelect from '@ui/components/inputs/group-select';
import UserSelect from '@ui/components/inputs/user-select';

interface Params {
  project: ProjectResource;
}

type IProps = Params & IDataActionProps & i18nProps;

class Owners extends React.Component<IProps> {
  updateGroup = async (groupId) => {
    const { updateGroup, t } = this.props;

    try {
      await updateGroup(groupId);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  };

  updateOwner = async (userId) => {
    const { updateOwner, t } = this.props;

    try {
      await updateOwner(userId);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }
  };

  render() {
    const { t, group, organization, owner } = this.props;
    const groupId = group.id;
    const ownerId = owner.id;
    const { name: orgName } = attributesFor(organization);

    return (
      <div className='thin-bottom-border p-t-md p-b-sm p-l-md p-r-md'>
        <div className='m-b-md'>
          <h4 className='fs-11 m-b-sm'>{t('project.side.organization')}</h4>
          <div className='p-l-sm p-r-sm p-t-sm p-b-sm thin-bottom-border'>
            <span>{orgName}</span>
          </div>
        </div>
        <div className='m-b-md'>
          <h4 className='fs-11 m-b-sm'>{t('project.side.projectOwner')}</h4>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow p-l-sm p-r-sm p-t-sm p-b-sm thin-bottom-border'>
              <UserSelect
                selected={ownerId}
                groupId={groupId}
                restrictToGroup={true}
                scopeToOrganization={organization}
                onChange={this.updateOwner}
              />
            </div>
          </div>
        </div>
        <div className='m-b-md'>
          <h4 className='fs-11 m-b-sm'>{t('project.side.projectGroup')}</h4>
          <div className='flex-grow p-l-sm p-r-sm p-t-sm p-b-sm'>
            <GroupSelect
              data-test-group-select
              scopeToCurrentUser={true}
              scopeToOrganization={organization}
              selected={groupId}
              onChange={this.updateGroup}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit((passedProps: IProps) => {
    const { project } = passedProps;

    return {
      group: (q) => q.findRelatedRecord(project, 'group'),
      organization: (q) => q.findRelatedRecord(project, 'organization'),
      owner: (q) => q.findRelatedRecord(project, 'owner'),
    };
  }),
  withDataActions
)(Owners);
