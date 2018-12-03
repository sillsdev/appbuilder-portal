import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';
import * as prettyMs from 'pretty-ms';

import { withTranslations, i18nProps } from '@lib/i18n';

import ProductIcon from '@ui/components/product-icon';
import { RectLoader as Loader } from '@ui/components/loaders';
import { ResourceObject } from 'jsonapi-typescript';
import {
  withLoader,
  attributesFor,
  idFromRecordIdentity,
  TaskResource, WorkflowDefinitionResource,
  ProductResource, ProjectResource, ProductDefinitionResource,
  UserResource
} from '@data';

export interface IOwnProps {
  userTask: TaskResource;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
  project: ProjectResource;
  assignedTo: UserResource;
  workflow: WorkflowDefinitionResource;
  cellClasses: string;
  cellSecondaryClasses: string;
}

export type IProps =
  & RouteComponentProps
  & IOwnProps
  & i18nProps;

class TaskRow extends React.Component<IProps> {
  didClickRow = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { workflow, product, history, userTask } = this.props;
    const { workflowBusinessFlow } = attributesFor(workflow);
    const id = idFromRecordIdentity(product);

    history.push(`/flow/${workflowBusinessFlow}/${id}`);
  }

  render() {
    const {
      t, userTask, product, project, assignedTo,
      productDefinition,
      cellClasses, cellSecondaryClasses
    } = this.props;

    const { status, waitTime } = attributesFor(userTask);
    const { name } = attributesFor(assignedTo);

    const claimedBy = name || t('tasks.unclaimed');

    const { name: projectName } = attributesFor(project);
    const { name: productName } = attributesFor(productDefinition);

    return (
      <tr onClick={this.didClickRow}>
        <td>
          <Link to={`/projects/${project.id}`}>{projectName}</Link>
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

export default compose(
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
