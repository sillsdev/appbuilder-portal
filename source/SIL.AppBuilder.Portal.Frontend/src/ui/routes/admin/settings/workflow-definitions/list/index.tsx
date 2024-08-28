import * as React from 'react';
import { compose, withProps } from 'recompose';
import { query, buildOptions, withLoader, WorkflowDefinitionResource, attributesFor } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compareVia } from '@lib/collection';

import { addWorkflowDefinitionPathName } from '../index';

import WorkflowDefinitionItem from './item';

interface IOwnProps {
  workflowDefinitions: WorkflowDefinitionResource[];
}

type IProps = IOwnProps & i18nProps & RouteComponentProps<{}>;

class ListWorkflowDefinition extends React.Component<IProps> {
  showAddForm = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(addWorkflowDefinitionPathName);
  };

  render() {
    const { t, workflowDefinitions } = this.props;

    return (
      <>
        <h2 className='sub-page-heading'>{t('admin.settings.workflowDefinitions.title')}</h2>
        <div className='m-b-xxl'>
          <button className='ui button tertiary uppercase large m-b-lg' onClick={this.showAddForm}>
            {t('admin.settings.workflowDefinitions.add')}
          </button>
          {workflowDefinitions.map((workflowDefinition) => (
            <WorkflowDefinitionItem
              key={workflowDefinition.id}
              workflowDefinition={workflowDefinition}
            />
          ))}
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  query(() => ({
    workflowDefinitions: [
      (q) => q.findRecords('workflowDefinition'),
      buildOptions({
        include: ['store-type'],
      }),
    ],
  })),
  withLoader(({ workflowDefinitions }) => !workflowDefinitions),
  withProps(({ workflowDefinitions }) => ({
    workflowDefinitions: workflowDefinitions.sort(
      compareVia((wfd) => attributesFor(wfd).name.toLowerCase())
    ),
  }))
)(ListWorkflowDefinition);
