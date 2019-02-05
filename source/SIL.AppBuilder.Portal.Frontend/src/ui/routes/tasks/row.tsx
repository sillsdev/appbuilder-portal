import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Card, Label } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';
import * as prettyMs from 'pretty-ms';
import { withTranslations, i18nProps } from '@lib/i18n';
import ProductIcon from '@ui/components/product-icon';

import {
  attributesFor,
  idFromRecordIdentity,
  TaskResource,
  WorkflowDefinitionResource,
  ProductResource,
  ProjectResource,
  ProductDefinitionResource,
  UserResource,
  withLoader,
} from '@data';

import productDefinitionSelect from '~/ui/components/inputs/product-definition-select';

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

export type IProps = INeededProps & RouteComponentProps & IOwnProps & i18nProps;

class TaskRow extends React.Component<IProps> {
  didClickRow = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { workflow, product, history } = this.props;
    const { workflowBusinessFlow } = attributesFor(workflow);
    const id = idFromRecordIdentity(product);

    history.push(`/flow/${workflowBusinessFlow}/${id}`);
  };

  didClickProjectName = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { history, project } = this.props;

    history.push(`/projects/${idFromRecordIdentity(project)}`);
  };

  render() {
    const {
      t,
      userTask,
      project,
      assignedTo,
      productDefinition,
      cellClasses,
      cellSecondaryClasses,
    } = this.props;

    const { comment, status, waitTime } = attributesFor(userTask);
    const { name: projectName } = attributesFor(project);
    const { name: productName } = attributesFor(productDefinition);

    return (
      <>
        <tr
          data-test-row
          className={`pointer p-t-md p-b-md ${comment ? 'no-bottom-border' : ''}`}
          onClick={this.didClickRow}
        >
          <td>
            <div className='flex align-items-center m-b-sm' onClick={this.didClickRow}>
              <ProductIcon product={productDefinition} selected={true} />
              <span className='p-l-sm-xs'>{productName}</span>
            </div>
            <Label className='grey m-l-lg uppercase'>{status}</Label>
          </td>
          <td>
            <a
              className='clickable'
              href={`/projects/${idFromRecordIdentity(project)}`}
              onClick={this.didClickProjectName}
            >
              {projectName}
            </a>
          </td>
          <td>{waitTime && prettyMs(waitTime)}</td>
        </tr>
        {comment && (
          <tr data-test-comment className='no-top-border'>
            <td style={{ paddingTop: 0 }} className='fs-12 no-top-border' colSpan={5}>
              <span className='p-l-lg block'>{comment}</span>
            </td>
          </tr>
        )}
      </>
    );
  }
}

export default compose<INeededProps, IProps>(
  withTranslations,
  withRouter,
  withOrbit(({ userTask }) => {
    return {
      product: (q) => q.findRelatedRecord(userTask, 'product'),
      assignedTo: (q) => q.findRelatedRecord(userTask, 'assigned'),
    };
  }),
  withOrbit(({ product }) => ({
    project: (q) => q.findRelatedRecord(product, 'project'),
    productDefinition: (q) => q.findRelatedRecord(product, 'productDefinition'),
  })),
  withOrbit(({ productDefinition }) => ({
    workflow: (q) => q.findRelatedRecord(productDefinition, 'workflow'),
  }))
)(TaskRow);
