import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  ProjectResource, attributesFor, OrganizationResource,
  UserResource, GroupResource
} from '@data';
import { i18nProps, withTranslations } from '@lib/i18n';

import Products from './products';

interface IExpectedProps {
  project: ProjectResource;
}

interface IComposedProps {
  group: GroupResource;
  organization: OrganizationResource;
  owner: UserResource;
  organizationOwner: UserResource;
}

type IProps =
  & IExpectedProps
  & IComposedProps
  & i18nProps;

class Details extends React.PureComponent<IProps> {
  render() {
    const { t, organization, owner, project, organizationOwner } = this.props;
    const { description } = attributesFor(project);
    const { name: organizationName, logoUrl } = attributesFor(organization);
    const { name: orgOwnerName } = attributesFor(organizationOwner);

    const logo = logoUrl
      ? <img src={logoUrl} style={{ maxHeight: '60px', maxWidth: '60px' }} />
      : '\u00A0';

    return (
      <div className='flex-grow p-r-lg-lg'>
        <div data-test-public-project-details className='m-b-lg'>

          <div className='m-b-md thin-bottom-border p-b-lg flex-row justify-content-start align-items-center'>
            <span>{logo}</span>

            <div className='p-l-lg'>
              <h2 className='p-r-sm p-t-sm p-b-none'>
                {organizationName}
              </h2>
              <div className='italic'>
                <label>{t('project.organizationContact')}</label>
                <strong>{orgOwnerName}</strong>
              </div>

              <div className='italic'>
                <label>{t('project.projectOwner')}</label>
                <strong>{attributesFor(owner).name}</strong>
              </div>
            </div>
          </div>

          <div className='p-b-lg fs-16'>
            {description}
          </div>
        </div>


        <Products project={project} />
      </div>
    );
  }
}

export default compose<IProps, IExpectedProps>(
  withTranslations,
  withOrbit((passedProps: IExpectedProps) => {
    const { project } = passedProps;

    return {
      group: q => q.findRelatedRecord(project, 'group'),
      organization: q => q.findRelatedRecord(project, 'organization'),
      owner: q => q.findRelatedRecord(project, 'owner'),
    };
  }),
  withOrbit((passedProps: { organization: OrganizationResource }) => {
    const { organization } = passedProps;

    return {
      organizationOwner: q => q.findRelatedRecord(organization, 'owner'),
    };
  })
)(Details);