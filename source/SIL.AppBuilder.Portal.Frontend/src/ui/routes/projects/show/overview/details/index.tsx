import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { Form } from 'semantic-ui-react';

import { ProjectResource, ApplicationTypeResource, attributesFor } from '@data';

import {
  withDataActions,
  IProvidedProps as IProjectActions,
} from '@data/containers/resources/project/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';
import AutoSavingInput from '@ui/components/inputs/auto-saving-input';

interface INeededProps {
  project: ProjectResource;
}

interface IDataProps {
  applicationType: ApplicationTypeResource;
}

type IProps = INeededProps & IDataProps & i18nProps & IProjectActions;

class Details extends React.Component<IProps> {
  updateDescription = async (value: string) => {
    const { t, updateAttribute } = this.props;

    try {
      await updateAttribute('description', value);

      toast.success(t('common.updated'));
    } catch (e) {
      toast.error(e);
    }
  };

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
        <div className='p-t-lg p-b-lg fs-16'>
          <AutoSavingInput value={description} onChange={this.updateDescription} />
        </div>
      </div>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withOrbit(({ project }) => {
    return {
      applicationType: (q) => q.findRelatedRecord(project, 'type'),
    };
  }),
  withDataActions
)(Details);
