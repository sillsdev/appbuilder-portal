import * as React from 'react';
import * as Toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withTranslations, i18nProps } from '@lib/i18n';

import {
  withDataActions,
  IProvidedProps as IWorkflowDefinitionProps
} from '@data/containers/resources/workflow-definition/with-data-actions';

import WorkflowDefinitionForm from '../common/form';

import { listPathName } from '../index';

type IProps =
  & i18nProps
  & IWorkflowDefinitionProps
  & RouteComponentProps<{}>;

class NewWorkflowDefinition extends React.Component<IProps> {

  save = async (attributes, onSuccess) => {

    const { t, createRecord } = this.props;

    try {
      
      await createRecord({
        name: attributes.name,
        description: attributes.description,
        workflowScheme: attributes.workflowScheme,
        workflowBusinessFlow: attributes.workflowBusinessFlow,
        enabled: attributes.enabled
      },{
        storeType: attributes.storeType
      });
      onSuccess();
      this.redirectToList();
      Toast.success(t('admin.settings.workflowDefinitions.workflowAdded'));
    } catch (e) {
      Toast.error(e);
    }
  }

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  }

  render() {

    const workflowDefinitionProps = {
      onSubmit: this.save,
      onCancel: this.redirectToList
    };

    return <WorkflowDefinitionForm {...workflowDefinitionProps}/>;
  }

}

export default compose(
  withRouter,
  withDataActions,
  withTranslations
)(NewWorkflowDefinition);