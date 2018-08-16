import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { tomorrow } from '@lib/date';

import { OrganizationInviteAttributes } from '@data/models/organization-invite';

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

@withTemplateHelpers
export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  mut: Mut;

  constructor(props) {
    super(props);

    const { name, orgAdminEmail, websiteUrl } = props;

    this.state = {
      name,
      ownerEmail: orgAdminEmail,
      url: websiteUrl,
      expiresAt: tomorrow()
    };
  }

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await this.props.onSubmit(this.state);

    this.setState({});
  }

  render() {
    const { mut } = this;
    const { name, ownerEmail, url } = this.state;

    return (
      <div>
        <form data-test-form className='ui form'>

          <div className='field'>
            <label>Organization Owner Email</label>
            <input
              data-test-owner-email
              type='text'
              value={ownerEmail || ''}
              onChange={mut('ownerEmail')} />
          </div>

          <div className='field'>
            <label>Organization Name</label>
            <input
              data-test-org-name
              type='text'
              value={name || ''}
              onChange={mut('name')} />
          </div>


          <div className='field'>
            <label>Organization Website URL</label>
            <input
              data-test-org-url
              type='text'
              value={url || ''}
              onChange={mut('url')} />
          </div>

          <button
            data-test-submit
            className='ui primary button'
            onClick={this.submit}>
            Add Organization
          </button>

        </form>
      </div>
    );
  }
}
