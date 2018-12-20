import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import { withTemplateHelpers, Toggle } from 'react-action-decorators';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

import { defaultOptions } from '@data';
import { getCurrentOrganizationId } from "@lib/current-organization";
import { i18nProps, withTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';
import { ErrorMessage } from '@ui/components/errors';

import UserInput from './user-input';
import { withCurrentOrganization } from '~/data/containers/with-current-organization';
import { attributesFor } from '@data/helpers';
interface IOwnProps{
  onUserAdded: () => Promise<void>;
}

export type IProps = IOwnProps
  & i18nProps
  & WithDataProps;

@withTemplateHelpers
class AddUserModal extends React.Component<IProps>{
  toggle: Toggle;

  state = {
    isModalOpen: false,
    error: null,
  };

  onAdd = async (email: string) => {
    const {dataStore, onUserAdded, t} = this.props;
    try {
      this.setState({error: null});

      await dataStore.update(q => q.addRecord({
        type: "organizationMembership",
        attributes: {
          email,
          "organizationId": getCurrentOrganizationId(),
        }
      }), defaultOptions());

      await onUserAdded();
      this.toggle('isModalOpen')();
      toast.success(`User for email address ${email} added to organization.`, { });
    }
    catch(err){
      this.setState({error: t("users.addUser.error")});
    }
  }

  render(){
    const { t, organization } = this.props;
    const { error } = this.state;
    const toggleModal = this.toggle('isModalOpen');
    const trigger = (<div data-test-users-adduser-open className='flex align-items-center p-l-lg m-b-sm' onClick={toggleModal}><AddIcon/><div>{t('users.addUser.button', {organization: attributesFor(organization).name})}</div></div>);
    const {isModalOpen} = this.state;
    return (<Modal
      data-test-users-adduser-modal
      open={isModalOpen}
      trigger={trigger}
      className='medium products-modal'
      closeIcon={<CloseIcon className='close-modal' />}
      onClose={toggleModal}>
        <Modal.Header>{t("users.addUser.modalTitle", {organization: attributesFor(organization).name})}</Modal.Header>
        <Modal.Content>
          <UserInput onSubmit={this.onAdd}/>
          { (error) ? (<div data-test-error><ErrorMessage error={error} showClose={false}/></div>) : null }
        </Modal.Content>
      </Modal>);
  }
}

export default compose(
  withTranslations,
  withCurrentOrganization,
  withData({}))(AddUserModal);
