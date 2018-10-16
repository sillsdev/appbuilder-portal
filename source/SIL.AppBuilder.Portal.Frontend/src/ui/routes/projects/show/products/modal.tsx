import * as React from 'react';
import { compose } from 'recompose';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import { withTranslations, i18nProps } from '@lib/i18n';

class ProductModal extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    const trigger = (
      <button className='ui button'>
        {t('project.products.add')}
      </button>
    );

    return (
      <Modal
        trigger={trigger}
        className='medium products-modal'
        closeIcon={<CloseIcon className='close-modal' />}
      >
        <Modal.Header>{t('project.products.popup.title')}</Modal.Header>
        <Modal.Content>
          Products
        </Modal.Content>
        <Modal.Actions>
          <button className='ui button huge'>
            {t('project.products.popup.done')}
          </button>
        </Modal.Actions>
      </Modal>
    );
  }

}

export default compose(
  withTranslations
)(ProductModal);