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

  submit = async (e: Event) => {
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
        <form className='ui form'>

          <div className='field'>
            <label>Organization Owner Email</label>
            <input type='text' value={ownerEmail} onChange={mut('ownerEmail')} />
          </div>

          <div className='field'>
            <label>Organization Name</label>
            <input type='text' value={name} onChange={mut('name')} />
          </div>

          <button
            className='ui primary button'
            onClick={this.submit}>
            Add Organization
          </button>

        </form>
      </div>
    );
  }
}
