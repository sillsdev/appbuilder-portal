import * as React from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { RequestAccessForOrganizationAttributes as Attributes } from '@data/models/organization-invite';
import FocusPanel from '@ui/components/focus-panel';

export interface IProps {
  onSubmit: (data: Attributes) => void;
  error?: string;
}

export interface IState {
  name: string;
  orgAdminEmail: string;
  websiteUrl: string;
}

@withTemplateHelpers
class RequestAccessForOrganizationDisplay extends React.Component<IProps, IState> {
  mut: Mut;
  state = { name: '', orgAdminEmail: '', websiteUrl: '' };

  onSubmit = (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const { name, orgAdminEmail, websiteUrl } = this.state;

    onSubmit({ name, orgAdminEmail, websiteUrl });
  }
  render() {
    const { mut } = this;
    const { name, orgAdminEmail, websiteUrl } = this.state;
    const { error } = this.props;

    const hasError = error && error.length > 0;

    return (
      <FocusPanel title={'Request Organization Invite'}>
        <Form data-test-form onSubmit={this.onSubmit}>
          { hasError && (
            <Message negative data-test-error-message>
              <Message.Header>{error}</Message.Header>
            </Message>
          )}
          <Form.Field>
            <label>Organization Name</label>
            <input required data-test-name
              type='text'
              value={name}
              onChange={mut('name')}
            />
          </Form.Field>

          <Form.Field>
            <label>Organization Admin Email</label>
            <input required data-test-email
              type='email'
              value={orgAdminEmail}
              onChange={mut('orgAdminEmail')}
            />
          </Form.Field>

          <Form.Field>
            <label>Website URL</label>
            <input required data-test-site
              type='text'
              value={websiteUrl}
              onChange={mut('websiteUrl')}
            />
          </Form.Field>

          <Button
            data-test-submit
            className='w-100'
            type='submit'>
            Submit
          </Button>
        </Form>
      </FocusPanel>

    );
  }
}

export default RequestAccessForOrganizationDisplay;
