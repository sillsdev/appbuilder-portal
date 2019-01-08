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
}

export type IProps = IOwnProps
  & i18nProps
  & WithDataProps;

@withTemplateHelpers
class InviteUserModal
 extends React.Component<IProps>{
  toggle: Toggle;

  state = {
    isModalOpen: false,
    error: null,
  };

  onInvite = async (email: string) => {
    const {t, dataStore, onUserInvited} = this.props;
    try {
      this.setState({error: null});

      await dataStore.update(q => q.addRecord({
        type: "organizationMembershipInvite",
        attributes: {
          email,
          "organizationId": getCurrentOrganizationId(),
        }
      }), defaultOptions());
      this.toggle('isModalOpen')();
      toast.success(t('users.invite.success', {email}), {});
    }
    catch(err){
      this.setState({error: t("users.invite.error")});
    }
  }

  toggleModal = () => {
    if (this.state.isModalOpen) {
      this.setState({error: null});
    }
    this.toggle('isModalOpen')();
  }

  render(){
    const { t, currentOrganization } = this.props;
    const { error, isModalOpen } = this.state;

    const trigger = (
      <div
        data-test-users-adduser-open
        className='flex align-items-center p-l-lg m-b-sm pointer'
        onClick={this.toggleModal}
      >
        <AddIcon/>
        <div>
          {t('users.invite.button', {organization: attributesFor(currentOrganization).name})}
        </div>
      </div>
    );

    return (<Modal
      data-test-users-adduser-modal
      open={isModalOpen}
      trigger={trigger}
      className='medium products-modal'
      closeIcon={<CloseIcon className='close-modal' />}
      onClose={this.toggleModal}>
        <Modal.Header>{t("users.invite.modalTitle", {organization: attributesFor(currentOrganization).name})}</Modal.Header>
        <Modal.Content>
          <UserInput onSubmit={this.onInvite}/>
          { (error) ? (<div data-test-error><ErrorMessage error={error} showClose={false}/></div>) : null }
        </Modal.Content>
      </Modal>);
  }
}

export default compose(
  withTranslations,
  withCurrentOrganization,
  withData({})
)(InviteUserModal);
