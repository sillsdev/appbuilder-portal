import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { tomorrow } from '@lib/date';

import { OrganizationInviteAttributes } from '@data/models/organization-invite';

export interface IProps {
  onSubmit: (data: OrganizationInviteAttributes) => Promise<void>;
}

export interface IState {
  name: string;
  ownerEmail: string;
  expiresAt: Date;
}

@withTemplateHelpers
export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  mut: Mut;
  state = { name: '', ownerEmail: '', expiresAt: tomorrow() };

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await this.props.onSubmit(this.state);
    this.reset();
  }

  reset = () => {
    this.setState({ name: '', ownerEmail: '', expiresAt: tomorrow() });
  }

  render() {
    const { mut } = this;
    const { name, ownerEmail } = this.state;

    return (
      <div>
        <form data-test-form className='ui form'>

          <div className='field'>
            <label>Organization Owner Email</label>
            <input
              data-test-owner-email
              type='text'
              value={ownerEmail}
              onChange={mut('ownerEmail')} />
          </div>

          <div className='field'>
            <label>Organization Name</label>
            <input
              data-test-org-name
              type='text'
              value={name}
              onChange={mut('name')} />
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
