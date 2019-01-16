import * as React from 'react';
import { compose } from 'recompose';
import CreateIcon from '@material-ui/icons/Create';
import { withData as withOrbit } from 'react-orbitjs';

import {
  attributesFor,
  idFromRecordIdentity,
  WorkflowDefinitionResource,
  StoreTypeResource,
} from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { Link } from 'react-router-dom';

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
  storeType: StoreTypeResource;
}

type IProps = IOwnProps & i18nProps;

class WorkflowDefinitionItem extends React.Component<IProps> {
  render() {
    const { t, workflowDefinition, storeType } = this.props;

    const { name, description, workflowScheme, workflowBusinessFlow } = attributesFor(
      workflowDefinition
    );

    return (
      <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
        <div className='flex-grow'>
          <div className='bold fs-16'>{name}</div>
          <div className='p-t-md'>
            <span className='bold m-r-sm'>
              {t('admin.settings.workflowDefinitions.description')}:
            </span>
            <span>{description}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.workflowDefinitions.storeType')}:
            </span>
            <span>{attributesFor(storeType).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.workflowDefinitions.workflowScheme')}:
            </span>
            <span>{workflowScheme}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.workflowDefinitions.workflowBusinessFlow')}:
            </span>
            <span>{workflowBusinessFlow}</span>
          </div>
        </div>
        <div>
          <Link
            className='gray-text'
            to={`/admin/settings/workflow-definitions/${idFromRecordIdentity(
              workflowDefinition
            )}/edit`}
          >
            <CreateIcon className='fs-16' />
          </Link>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(({ workflowDefinition }) => ({
    storeType: (q) => q.findRelatedRecord(workflowDefinition, 'storeType'),
  }))
)(WorkflowDefinitionItem);
