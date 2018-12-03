import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProjectResource, attributesFor } from '@data';
import { i18nProps, withTranslations } from '@lib/i18n';

import Products from './products';

type IProps =
  & { project: ProjectResource }
  & i18nProps;

class Details extends React.PureComponent<IProps> {
  render() {
    const { organization, owner, project } = this.props;
    const { description } = attributesFor(project);

    return (
      <div className='flex-grow p-r-lg-lg'>
        <div data-test-public-project-details className='m-b-lg'>
          <div className='m-b-md thin-bottom-border p-b-lg'>
            <h3 className='p-l-sm p-r-sm p-t-sm p-b-none'>
              {attributesFor(organization).name}
            </h3>
            <div className='italic p-l-sm'>
              {attributesFor(owner).name}
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

export default compose(
  withTranslations,
  withOrbit((passedProps: IProps) => {
    const { project } = passedProps;

    return {
      // applicationType: q => q.findRelatedRecord(project, 'type'),
      group: q => q.findRelatedRecord(project, 'group'),
      organization: q => q.findRelatedRecord(project, 'organization'),
      owner: q => q.findRelatedRecord(project, 'owner'),
    };
  })
)(Details);