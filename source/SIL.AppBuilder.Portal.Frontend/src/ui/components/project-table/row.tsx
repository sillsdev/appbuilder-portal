import * as React from 'react';

import { Link } from 'react-router-dom';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { attributesFor } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';

import { withRelationship } from './withRelationship';
import ProductIcon from '@ui/components/product-icon';
import RowActions from '@ui/components/project-table/row-actions';

export interface IProps {
  project: JSONAPI<ProjectAttributes>;
  organization: JSONAPI<OrganizationAttributes>;
  toggleArchiveProject: (project: JSONAPI<ProjectAttributes>) => void;
}

// TODO: Remove this when we had products associated to projects
const htmlProduct = {
  id: '1',
  type: 'product',
  attributes: { name: 'HTML'}
};

const androidProduct = {
  id: '2',
  type: 'product',
  attributes: { name: 'Android APK (Streaming Audio) ' }
};

class Row extends React.Component<IProps & i18nProps> {

  render() {
    const { project: data, organization, t } = this.props;
    const { attributes: project } = data;
    // the organization _shouldn't_ be missing attributes
    // but it certainly can, when fake prorject data is used elsewhere.
    const { name: orgName } = attributesFor(organization);

    return (
      <>
        <div className='flex row-header grid'>
          <div className='col flex-grow-xs'><Link to={`/project/${data.id}`}>{project.name}</Link></div>
          <div className='col d-xs-none'>{orgName}</div>
          <div className='col d-xs-none'>{project.language}</div>
          <div className='action'>
            <RowActions project={data} />
          </div>
        </div>
        <div className='products-grid'>
          <div className='flex grid products-header'>
            <div className='col flex-grow-xs'>Products</div>
            <div className='col flex-grow-xs d-xs-none d-md-block'>Status</div>
            <div className='col flex-grow-xs d-xs-none d-md-block'>Last updated</div>
            <div className='action flex-grow-xs d-xs-none d-md-block' />
          </div>
          <div className='flex flex-column-xs flex-row-md grid product'>
            <div className='col flex-grow-xs w-100-xs-only'>
              <ProductIcon product={htmlProduct}/>
              {htmlProduct.attributes.name}
            </div>
            <div className='col flex-grow-xs w-100-xs-only'>Build(v1.0)</div>
            <div className='col flex-grow-xs w-100-xs-only'>2018-04-21</div>
            <div className='action' />
          </div>
          <div className='flex flex-column-xs flex-row-md grid product'>
            <div className='col flex-grow-xs w-100-xs-only'>
              <ProductIcon product={androidProduct} />
              {androidProduct.attributes.name}
            </div>
            <div className='col flex-grow-xs w-100-xs-only'>Build(v1.12.1)</div>
            <div className='col flex-grow-xs w-100-xs-only'>2018-05-22</div>
            <div className='action flex-grow-xs w-100-xs-only'/>
          </div>
        </div>
      </>
    );
  }
}

export default compose(
  translate('translations'),
  withRelationship('organization')
)(Row);
