import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProjectResource, ApplicationTypeResource, attributesFor } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';

interface Params {
  project: ProjectResource;
  applicationType: ApplicationTypeResource;
}

type IProps = Params & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { project } = passedProps;

  return {
    applicationType: (q) => q.findRelatedRecord(project, 'type'),
  };
};

class Details extends React.Component<IProps> {
  render() {
    const { t, project, applicationType } = this.props;
    const { language, description } = attributesFor(project);
    const { description: type } = attributesFor(applicationType);

    return (
      <div data-test-project-details className='thin-bottom-border m-b-lg'>
        <h3 className='fs-21'>{t('project.details.title')}</h3>
        <div className='flex justify-content-space-around'>
          <div className='flex-grow'>
            <h4 className='fs-11'>{t('project.details.language')}</h4>
            <p data-test-project-detail-language className='m-r-lg p-b-sm fs-16 thin-bottom-border'>
              {language}
            </p>
          </div>
          <div className='flex-grow'>
            <h4 className='fs-11'>{t('project.details.type')}</h4>
            <p data-test-project-detail-type className='p-b-sm fs-16 thin-bottom-border'>
              {type}
            </p>
          </div>
        </div>
        <div className='p-t-lg p-b-lg fs-16'>{description}</div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps)
)(Details);
