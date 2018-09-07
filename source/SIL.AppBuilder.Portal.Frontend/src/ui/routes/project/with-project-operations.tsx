import * as React from 'react';

import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withData, WithDataProps } from 'react-orbitjs';
import { TYPE_NAME as PROJECT, ProjectAttributes} from '@data/models/project';
import { attributesFor, defaultOptions, PROJECTS_TYPE } from '@data';

import * as toast from '@lib/toast';
import { ResourceObject } from 'jsonapi-typescript';
import { withDataActions, IProvidedProps } from '@data/containers/resources/project/with-data-actions';

export function withProjectOperations(WrappedComponent) {

  class DataWrapper extends React.Component<WithDataProps & i18nProps & IProvidedProps> {

    toggleArchiveProject = async (project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>) => {

      const { t, updateAttribute } = this.props;
      const { dateArchived } = attributesFor(project);
      const nextValue = !dateArchived ? new Date() : null;

      try {
        await updateAttribute('dateArchived', nextValue);

        toast.success(!dateArchived ? t('project.operations.archive.success') : t('project.operations.reactivate.success'));

      } catch (e) {
        console.error(e);
        toast.error(!dateArchived ? t('project.operations.archive.error') : t('project.operations.reactivate.error'));
      }

    }

    render() {

      const actionProps = {
        toggleArchiveProject: this.toggleArchiveProject
      };

      return (
        <WrappedComponent {...actionProps} {...this.props}/>
      );
    }

  }

  return compose(
    withDataActions,
    withTranslations
  )(DataWrapper);
}
