import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  withDataActions,
  IProvidedProps as IWorkflowDefinitionProps,
} from '@data/containers/resources/workflow-definition/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';

import WorkflowDefinitionForm from '../common/form';
import { listPathName } from '../index';

type IProps = i18nProps & IWorkflowDefinitionProps & RouteComponentProps<{}>;

class NewWorkflowDefinition extends React.Component<IProps> {
  save = async (attributes, relationships) => {
    const { createRecord, t } = this.props;
    await createRecord(attributes, relationships);
    toast.success(t('admin.settings.workflowDefinitions.workflowAdded'));
    this.redirectToList();
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const workflowDefinitionProps = {
      onSubmit: this.save,
      onCancel: this.redirectToList,
    };

    return <WorkflowDefinitionForm {...workflowDefinitionProps} />;
  }
}

export default compose(withRouter, withDataActions, withTranslations)(NewWorkflowDefinition);
