import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';
import * as prettyMs from 'pretty-ms';

import { withTranslations, i18nProps } from '@lib/i18n';

import ProductIcon from '@ui/components/product-icon';
import {
  attributesFor,
  idFromRecordIdentity,
  TaskResource, WorkflowDefinitionResource,
  ProductResource, ProjectResource, ProductDefinitionResource,
  UserResource
} from '@data';

export interface IOwnProps {
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
  project: ProjectResource;
  assignedTo: UserResource;
  workflow: WorkflowDefinitionResource;
}

export interface INeededProps {
  userTask: TaskResource;
  cellClasses: string;
  cellSecondaryClasses: string;
}

export type IProps =
  & INeededProps
  & RouteComponentProps
  & IOwnProps
  & i18nProps;

class TaskRow extends React.Component<IProps> {
  didClickRow = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { workflow, product, history } = this.props;
    const { workflowBusinessFlow } = attributesFor(workflow);
    const id = idFromRecordIdentity(product);

    history.push(`/flow/${workflowBusinessFlow}/${id}`);
  }

  didClickProjectName = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { history, project } = this.props;

    history.push(`/projects/${idFromRecordIdentity(project)}`);
  }

  render() {
    const {
      t, userTask, project, assignedTo,
      productDefinition,
      cellClasses, cellSecondaryClasses
    } = this.props;

    const { status, waitTime } = attributesFor(userTask);
    const { name } = attributesFor(assignedTo);

    const claimedBy = name || t('tasks.unclaimed');

    const { name: projectName } = attributesFor(project);
    const { name: productName } = attributesFor(productDefinition);

    return (
      <tr className='pointer' onClick={this.didClickRow}>
        <td>
          <a href={`/projects/${idFromRecordIdentity(project)}`} onClick={this.didClickProjectName}>{projectName}</a>
        </td>
        <td className={cellSecondaryClasses}>
          <div className='flex align-items-center'>
            <ProductIcon product={productDefinition} selected={true}/>
            <span className='p-l-sm-xs'>{productName}</span>
          </div>
        </td>
        <td className={cellClasses}>{claimedBy}</td>
        <td className={cellClasses}>{status}</td>
        <td className={cellClasses}>
          {waitTime && prettyMs(waitTime)}
        </td>
        <td>
          <Button>{t('tasks.reassign')}</Button>
        </td>
      </tr>
    );
  }
}

export default compose<INeededProps, IProps>(
  withTranslations,
  withRouter,
  withOrbit(({ userTask }) => {
    return {
      product: q => q.findRelatedRecord(userTask, 'product'),
      assignedTo: q => q.findRelatedRecord(userTask, 'assigned')
    };
  }),
  withOrbit(({ product }) => ({
    project: q => q.findRelatedRecord(product, 'project'),
    productDefinition: q => q.findRelatedRecord(product, 'productDefinition'),
  })),
  withOrbit(({ productDefinition }) => ({
    workflow: q => q.findRelatedRecord(productDefinition, 'workflow'),
  }))
)( TaskRow );
