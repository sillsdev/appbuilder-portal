import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import {
  withDataActions,
  IProvidedProps as IWorkflowDefinitionProps,
} from '@data/containers/resources/workflow-definition/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';
import {
  query,
  withLoader,
  buildOptions,
  buildFindRecord,
  WorkflowDefinitionResource,
  StoreTypeResource,
} from '@data';

import WorkflowDefinitionForm from '../common/form';
import { listPathName } from '../index';

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
  storeType: StoreTypeResource;
}

type IProps = i18nProps & IWorkflowDefinitionProps & IOwnProps & RouteComponentProps<{}>;

class EditWorkflowDefinitions extends React.Component<IProps> {
  update = async (attributes, relationships) => {
    const { updateAttributes, t } = this.props;
    await updateAttributes(attributes, relationships);
    this.redirectToList();
    toast.success(t('admin.settings.workflowDefinitions.workflowUpdated'));
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const { workflowDefinition, storeType } = this.props;

    const workflowDefinitionProps = {
      workflowDefinition,
      storeType,
      onSubmit: this.update,
      onCancel: this.redirectToList,
    };

    return <WorkflowDefinitionForm {...workflowDefinitionProps} />;
  }
}

export default compose(
  withRouter,
  query(({ match: { params: { workflowDefinitionId } } }) => ({
    workflowDefinition: [
      (q) => buildFindRecord(q, 'workflowDefinition', workflowDefinitionId),
      buildOptions({
        include: ['store-type'],
      }),
    ],
  })),
  withLoader(({ workflowDefinition }) => !workflowDefinition),
  withOrbit(({ workflowDefinition }) => ({
    storeType: (q) => q.findRelatedRecord(workflowDefinition, 'storeType'),
  })),
  withDataActions,
  withTranslations
)(EditWorkflowDefinitions);
