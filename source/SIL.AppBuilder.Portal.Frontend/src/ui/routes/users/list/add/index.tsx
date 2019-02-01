import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

import { defaultOptions } from '@data';

import { getCurrentOrganizationId } from '@lib/current-organization';
import { i18nProps, withTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';
import { ErrorMessage } from '@ui/components/errors';
import { attributesFor } from '@data/helpers';
import { Toggle, toggleCreator } from 'react-state-helpers';

import UserInput from './user-input';

import {
  withCurrentOrganization,
  IProvidedProps as ICurrentOrganizationProps,
} from '~/data/containers/with-current-organization';
interface IOwnProps {
  onUserAdded: () => Promise<void>;
}

export type IProps = IOwnProps & i18nProps & WithDataProps & ICurrentOrganizationProps;

class AddUserModal extends React.Component<IProps> {
  toggle: Toggle;

  state = {
    isModalOpen: false,
    error: null,
  };

  constructor(props) {
    super(props);

    this.toggle = toggleCreator(this);
  }

  onAdd = async (email: string) => {
    const { dataStore, onUserAdded, t } = this.props;
    try {
      this.setState({ error: null });

      await dataStore.update(
        (q) =>
          q.addRecord({
            type: 'organizationMembership',
            attributes: {
              email,
              organizationId: getCurrentOrganizationId(),
            },
          }),
        defaultOptions()
      );

      await onUserAdded();
      this.toggle('isModalOpen')();
      toast.success(`User for email address ${email} added to organization.`, {});
    } catch (err) {
      this.setState({ error: t('users.addUser.error') });
    }
  };

  toggleModal = () => {
    if (this.state.isModalOpen) {
      this.setState({ error: null });
    }
    this.toggle('isModalOpen')();
  };

  render() {
    const { t, currentOrganization } = this.props;
    const { error, isModalOpen } = this.state;

    const trigger = (
      <div
        data-test-users-adduser-open
        className='flex align-items-center p-l-lg m-b-sm pointer'
        onClick={this.toggleModal}
      >
        <AddIcon />
        <div>
          {t('users.addUser.button', { organization: attributesFor(currentOrganization).name })}
        </div>
      </div>
    );

    return (
      <Modal
        data-test-users-adduser-modal
        open={isModalOpen}
        trigger={trigger}
        className='medium products-modal'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={this.toggleModal}
      >
        <Modal.Header>
          {t('users.addUser.modalTitle', { organization: attributesFor(currentOrganization).name })}
        </Modal.Header>
        <Modal.Content>
          <UserInput onSubmit={this.onAdd} />
          {error ? (
            <div data-test-error>
              <ErrorMessage error={error} showClose={false} />
            </div>
          ) : null}
        </Modal.Content>
      </Modal>
    );
  }
}

export default compose(
  withTranslations,
  withCurrentOrganization,
  withData({})
)(AddUserModal);
