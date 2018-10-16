import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';

import './styles.scss';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

type IProps =
  & Params
  & i18nProps;

class Products extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;

    const trigger = (
      <button className='ui button'>
        {t('project.products.add')}
      </button>
    );

    return (
      <div className='product'>
        <h3>{t('project.products.title')}</h3>
        <div className='empty-products flex align-items-center justify-content-center'>
          <span>{t('project.products.empty')}</span>
        </div>
        <Modal
          trigger={trigger}
          className='medium products-modal'
          closeIcon={<CloseIcon className='close-modal'/>}
        >
          <Modal.Header>Select products</Modal.Header>
          <Modal.Content>
            Products
          </Modal.Content>
          <Modal.Actions>
            <button className='ui button huge'>
              Done
            </button>
          </Modal.Actions>
        </Modal>
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Products);