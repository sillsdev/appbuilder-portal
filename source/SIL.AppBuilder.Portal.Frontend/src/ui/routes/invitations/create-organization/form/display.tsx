import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { OrganizationAttributes } from '@data/models/organization';

export interface IProps {
  token: string;
  onSubmit: (data: OrganizationAttributes) => Promise<void>;
}

export interface IState {
  name: string;
  websiteUrl: string;
}

@withTemplateHelpers
export default class InviteOrganizationDisplay extends React.Component<IProps, IState> {
  mut: Mut;
  state = { name: '', websiteUrl: '' };

  submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { onSubmit, token } = this.props;

    await onSubmit({ ...this.state, token });
  }

  render() {
    const { mut } = this;
    const { name, websiteUrl } = this.state;

    return (
      <div>
        <form data-test-org-create-form className='ui form'>
          <div className='field'>
            <label>Organization Name</label>
            <input
              data-test-org-name
              type='text'
              value={name}
              onChange={mut('name')} />
          </div>

          <div className='field'>
            <label>Organization Website URL</label>
            <input
              data-test-website
              type='text'
              value={websiteUrl}
              onChange={mut('websiteUrl')} />
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
