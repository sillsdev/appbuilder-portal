import * as React from 'react';

import { OrganizationAttributes } from '@data/models/organization';

export interface IProps {
  onSubmit: (data: OrganizationAttributes) => Promise<void>;
}

export interface IState {
  name: string;
}

export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  state = { name: '' };

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await this.props.onSubmit(this.state);
    this.reset();
  }

  reset = () => {
    this.setState({ name: '' });
  }

  nameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    this.setState({ name });
  }


  render() {
    const { name } = this.state;

    return (
      <div>
        <form className='ui form'>

          <div className='field'>
            <label>Organization Name</label>
            <input type='text' value={name || ''} onChange={this.nameChanged} />
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
