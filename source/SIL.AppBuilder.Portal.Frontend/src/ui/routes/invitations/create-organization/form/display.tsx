import * as React from 'react';
import { OrganizationAttributes } from '@data/models/organization';
import ErrorHeader from '@ui/components/errors/header-message';

import { withTranslations, i18nProps } from '~/lib/i18n';

import { Mut, mutCreator } from 'react-state-helpers';

export interface IProps {
  token: string;
  onSubmit: (data: OrganizationAttributes) => Promise<void>;
}

export interface IState {
  name: string;
  websiteUrl: string;
}

class InviteOrganizationDisplay extends React.Component<IProps & i18nProps, IState> {
  mut: Mut;
  state = { name: '', websiteUrl: '' };

  constructor(props) {
    super(props);

    this.mut = mutCreator(this);
  }

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { onSubmit, token } = this.props;

    await onSubmit({ ...this.state, token });
  };

  render() {
    const { mut } = this;
    const { name, websiteUrl } = this.state;
    const { t, error } = this.props;

    return (
      <div>
        <form data-test-org-create-form className='ui form'>
          {error ? <ErrorHeader error={error} /> : null}

          <div className='field'>
            <label>{t('invitations.orgName')}</label>
            <input data-test-org-name type='text' value={name} onChange={mut('name')} />
          </div>

          <div className='field'>
            <label>{t('invitations.orgUrl')}</label>
            <input data-test-website type='text' value={websiteUrl} onChange={mut('websiteUrl')} />
          </div>

          <button data-test-submit className='ui primary button' onClick={this.submit}>
            {t('invitations.orgSubmit')}
          </button>
        </form>
      </div>
    );
  }
}

export default withTranslations(InviteOrganizationDisplay);
