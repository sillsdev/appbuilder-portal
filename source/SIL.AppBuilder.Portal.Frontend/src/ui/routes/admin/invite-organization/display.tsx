import * as React from 'react';

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

export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  state = { name: '', ownerEmail: '', expiresAt: tomorrow() };

  submit = async (e: Event) => {
    e.preventDefault();

    await this.props.onSubmit(this.state);
    this.reset();
  }

  reset = () => {
    this.setState({ name: '', ownerEmail: '', expiresAt: tomorrow() });
  }

  ownerEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ownerEmail = e.target.value;

    this.setState({ ownerEmail });
  }

  nameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    this.setState({ name });
  }


  render() {
    const { name, ownerEmail } = this.state;

    return (
      <div>
        <form className='ui form'>

          <div className='field'>
            <label>Organization Owner Email</label>
            <input type='text' value={ownerEmail} onChange={this.ownerEmailChanged} />
          </div>

          <div className='field'>
            <label>Organization Name</label>
            <input type='text' value={name} onChange={this.nameChanged} />
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
