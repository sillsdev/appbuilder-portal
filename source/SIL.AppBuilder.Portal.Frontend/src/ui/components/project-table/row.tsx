import * as React from 'react';

import { Link } from 'react-router-dom';
import { Dropdown, Icon } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { withProjectOperations } from '@ui/routes/project/with-project-operations';

import { attributesFor } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';

import { withRelationship } from './withRelationship';
import ProductIcon from '@ui/components/product-icon';

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
}

const androidProduct = {
  id: '2',
  type: 'product',
  attributes: { name: 'Android APK (Streaming Audio) ' }
}

class Row extends React.Component<IProps & i18nProps> {

  toggleArchivedProject = (e) => {
    e.preventDefault();
    const { project, toggleArchiveProject } = this.props;
    toggleArchiveProject(project);
  }

  render() {
    const { project: data, organization, t } = this.props;
    const { attributes: project } = data;
    // the organization _shouldn't_ be missing attributes
    // but it certainly can, when fake prorject data is used elsewhere.
    const { name: orgName } = attributesFor(organization);

    const dropdownItemText = !project.dateArchived ?
      t('project.dropdown.archive') :
      t('project.dropdown.reactivate');

    return (
      <>
        <div className='flex row-header grid'>
          <div className='col'><Link to={`/project/${data.id}`}>{project.name}</Link></div>
          <div className='col'>{orgName}</div>
          <div className='col'>{project.language}</div>
          <div className='action'>
            <Dropdown
              className='project-actions'
              pointing='top right'
              icon={null}
              trigger={
                <Icon name='ellipsis vertical' size='large' />
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item text={t('project.dropdown.transfer')} />
                <Dropdown.Item
                  text={dropdownItemText}
                  onClick={this.toggleArchivedProject}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <div className='products-grid'>
          <div className='flex grid products-header'>
            <div className='col'>Products</div>
            <div className='col'>Status</div>
            <div className='col'>Last updated</div>
            <div className='action'></div>
          </div>
          <div className='flex grid product'>
            <div className='col'>
              <ProductIcon product={htmlProduct}/>
              {htmlProduct.attributes.name}
            </div>
            <div className='col'>Build(v1.0)</div>
            <div className='col'>2018-04-21</div>
            <div className='action'></div>
          </div>
          <div className='flex grid product'>
            <div className='col'>
              <ProductIcon product={androidProduct} />
              {androidProduct.attributes.name}
            </div>
            <div className='col'>Build(v1.12.1)</div>
            <div className='col'>2018-05-22</div>
            <div className='action'></div>
          </div>
        </div>
      </>
    );
  }
}

export default compose(
  translate('translations'),
  withRelationship('organization'),
  withProjectOperations
)(Row);
