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
import { withCurrentOrganization, IProvidedProps as ICurrentOrganizationProps } from '@data/containers/with-current-organization';
import { withCurrentUserContext, ICurrentUserProps } from '@data/containers/with-current-user';
import { attributesFor } from '@data/helpers';
import { idFromRecordIdentity } from '@data';
interface IOwnProps{
}

export type IProps = IOwnProps
  & i18nProps
  & WithDataProps
  & ICurrentUserProps
  & ICurrentOrganizationProps;

@withTemplateHelpers
class InviteUserModal
 extends React.Component<IProps>{
  toggle: Toggle;

  state = {
    isModalOpen: false,
    error: null,
  };

  onInvite = async (email: string) => {
    const {t, dataStore, currentUser } = this.props;
    try {
      this.setState({error: null});

      await dataStore.update(q => q.addRecord({
        type: "organizationMembershipInvite",
        attributes: {
          email,
          "organizationId": getCurrentOrganizationId(),
        }
      }), defaultOptions());
      toast.success(t('organization-membership.invite.create.success', {email}));
      this.toggle('isModalOpen')();
    }
    catch(err){
      this.setState({error: t("organization-membership.invite.create.error")});
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
        data-test-users-invite-user-open
        className='flex align-items-center p-l-lg m-b-sm pointer'
        onClick={this.toggleModal}
      >
        <AddIcon/>
        <div>
          {t('organization-membership.invite.create.invite-user-button-title', {organization: attributesFor(currentOrganization).name})}
        </div>
      </div>
    );

    return (<Modal
      data-test-users-invite-user-modal
      open={isModalOpen}
      trigger={trigger}
      className='medium products-modal'
      closeIcon={<CloseIcon className='close-modal' />}
      onClose={this.toggleModal}>
        <Modal.Header>{t("organization-membership.invite.create.invite-user-modal-title", {organization: attributesFor(currentOrganization).name})}</Modal.Header>
        <Modal.Content>
          <UserInput onSubmit={this.onInvite}/>
          { (error) ? (<div data-test-error><ErrorMessage error={error} showClose={false}/></div>) : null }
        </Modal.Content>
      </Modal>);
  }
}

export default compose(
  withTranslations,
  withCurrentUserContext,
  withCurrentOrganization,
  withData({})
)(InviteUserModal);
