import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { withData as withOrbit } from 'react-orbitjs';
import * as prettyMs from 'pretty-ms';

import { withTranslations, i18nProps } from '@lib/i18n';

import { TaskAttributes } from '@data/models/task';
import { ProductAttributes } from '@data/models/product';
import { ProjectAttributes } from '@data/models/project';
import { UserAttributes } from '@data/models/user';

import ProductIcon from '@ui/components/product-icon';
import { RectLoader as Loader } from '@ui/components/loaders';

export interface IOwnProps {
  task: JSONAPI<TaskAttributes>;
  product: JSONAPI<ProductAttributes>;
  project: JSONAPI<ProjectAttributes>;
  assignedTo: JSONAPI<UserAttributes>;
}

export type IProps =
  & IOwnProps
  & i18nProps;

const mapRecordsToProps = ({ task: { type, id } }) => ({
  project: q => q.findRelatedRecord({ type, id }, 'project'),
  product: q => q.findRelatedRecord({ type, id }, 'product'),
  assignedTo: q => q.findRelatedRecord({ type, id }, 'assigned')
});

class TaskRow extends React.Component<IProps> {
  render() {
    const { t, task, product, project, assignedTo } = this.props;

    if (!task || !task.attributes) {
      return <tr><td colSpan={6}><Loader /></td></tr>;
    }

    const { status, waitTime } = task.attributes;
    const { givenName, familyName } = (assignedTo || {}) as UserAttributes;
    const hasName = givenName || familyName;

    const claimedBy = hasName ? `${givenName || ''} ${familyName || ''}` : t('tasks.unclaimed');

    return (
      <tr>
        <td>
          <Link to={`/projects/${project.id}`}>{project.name}</Link>
        </td>
        <td>
          <ProductIcon product={product} />
        </td>
        <td>{claimedBy}</td>
        <td>{status}</td>
        <td>
          {prettyMs(waitTime)}
        </td>
        <td>
          <Button>{t('tasks.reassign')}</Button>
        </td>
      </tr>
    );
  }
}

export default compose(
  withOrbit(mapRecordsToProps),
  withTranslations
)( TaskRow );
