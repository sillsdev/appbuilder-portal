import * as React from 'react';
import * as Toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import { withTranslations, i18nProps } from '@lib/i18n';

import {
  withDataActions,
  IProvidedProps as IWorkflowDefinitionProps
} from '@data/containers/resources/workflow-definition/with-data-actions';

import WorkflowDefinitionForm from '../common/form';

import { listPathName } from '../index';
import { query, withLoader, buildOptions, buildFindRecord, WorkflowDefinitionResource, StoreTypeResource } from '@data';

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
  storeType: StoreTypeResource;
}

type IProps =
  & i18nProps
  & IWorkflowDefinitionProps
  & IOwnProps
  & RouteComponentProps<{}>;

class EditWorkflowDefinitions extends React.Component<IProps> {

  update = async (attributes, onSuccess) => {

    const { t, updateAttributes, updateStoreType } = this.props;

    try {
      await updateAttributes({
        name: attributes.name,
        description: attributes.description,
        workflowScheme: attributes.workflowScheme,
        workflowBusinessFlow: attributes.workflowBusinessFlow,
        enabled: attributes.enabled
      });
      await updateStoreType(attributes.storeType);
      onSuccess();
      this.redirectToList();
      Toast.success(t('workflowUpdated'));
    } catch(e) {
      Toast.error(e);
    }
  }

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {
    const { workflowDefinition, storeType } = this.props;

    const workflowDefinitionProps = {
      workflowDefinition,
      storeType,
      onSubmit: this.update,
      onCancel: this.redirectToList
    };

    return <WorkflowDefinitionForm {...workflowDefinitionProps} />;
  }
}

export default compose(
  withRouter,
  query(({ match: { params: { workflowDefinitionId } } }) => ({
    workflowDefinition: [
      q => buildFindRecord(q, 'workflowDefinition', workflowDefinitionId), buildOptions({
        include: ['storeType']
      })
    ],
  })),
  withLoader(({ workflowDefinition }) => !workflowDefinition),
  withOrbit(({workflowDefinition}) => ({
    storeType: q => q.findRelatedRecord(workflowDefinition, 'storeType')
  })),
  withDataActions,
  withTranslations
)(EditWorkflowDefinitions);

/*
 TODO:

 - load owner into form
 - create update function and hook it
 - fix sidebar navigation
 - add tests
*/