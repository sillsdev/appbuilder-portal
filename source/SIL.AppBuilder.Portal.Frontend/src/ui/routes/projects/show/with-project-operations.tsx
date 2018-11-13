import * as React from 'react';
import { compose } from 'recompose';

import * as toast from '@lib/toast';
import { attributesFor, ProjectResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

import {
  withDataActions,
  IProvidedProps as ProjectDataActionProps
} from '@data/containers/resources/project/with-data-actions';

interface IOwnProps {
  project: ProjectResource;
}
type IProps =
  & IOwnProps
  & i18nProps
  & ProjectDataActionProps;

export function withProjectOperations(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    toggleArchiveProject = async () => {

      const { t, updateAttribute, project } = this.props;
      const { dateArchived } = attributesFor(project);
      const nextValue = !dateArchived ? new Date() : null;

      try {
        await updateAttribute('dateArchived', nextValue);
        toast.success(
          !dateArchived ?
            t('project.operations.archive.success') :
            t('project.operations.reactivate.success')
        );
      } catch (e) {
        console.error(e);
        toast.error(
          !dateArchived ?
            t('project.operations.archive.error') :
            t('project.operations.reactivate.error')
        );
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
