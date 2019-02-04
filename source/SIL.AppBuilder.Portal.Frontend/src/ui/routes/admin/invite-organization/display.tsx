import * as React from 'react';
import { mutCreator, Mut } from 'react-state-helpers';
import { tomorrow } from '@lib/date';
import { OrganizationInviteAttributes } from '@data/models/organization-invite';

import './styles.scss';

export interface IProps {
  onSubmit: (data: OrganizationInviteAttributes) => Promise<void>;
  name?: string;
  orgAdminEmail?: string;
  websiteUrl?: string;
}

export interface IState {
  name?: string;
  ownerEmail?: string;
  expiresAt?: Date;
  url?: string;
}

export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  mut: Mut;

  constructor(props) {
    super(props);

    const { name, orgAdminEmail, websiteUrl } = props;

    this.mut = mutCreator(this);
    this.state = {
      name,
      ownerEmail: orgAdminEmail,
      url: websiteUrl,
      expiresAt: tomorrow(),
    };
  }

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await this.props.onSubmit(this.state);

    this.setState({ name: '', ownerEmail: '', url: '', expiresAt: tomorrow() });
  };

  render() {
    const { mut } = this;
    const { name, ownerEmail, url } = this.state;

    return (
      <div className='flex invite-organization'>
        <form data-test-form className='ui form flex-grow'>
          <div className='field m-b-xl'>
            <label>Organization Owner Email</label>
            <input
              data-test-owner-email
              type='text'
              value={ownerEmail || ''}
              onChange={mut('ownerEmail')}
            />
          </div>

          <div className='field m-b-xl'>
            <label>Organization Name</label>
            <input data-test-org-name type='text' value={name || ''} onChange={mut('name')} />
          </div>

          <div className='field m-b-xl'>
            <label>Organization Website URL</label>
            <input data-test-org-url type='text' value={url || ''} onChange={mut('url')} />
          </div>

          <button
            data-test-submit
            className='ui button p-t-md p-b-md p-l-lg p-r-lg'
            onClick={this.submit}
          >
            Add Organization
          </button>
        </form>
      </div>
    );
  }
}
