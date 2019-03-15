import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { RequestAccessForOrganizationAttributes as Attributes } from '@data/models/organization-invite';
import { requestOrgAccessSuccessPath as successPath } from '@ui/routes/paths';

import Display from './display';

export type IProps = {} & RouteComponentProps<{}>;

export interface IState {
  error?: string;
}

class RequestAccessForOrganizationRoute extends React.Component<IProps, IState> {
  state = { error: undefined };

  onSubmit = async (data: Attributes) => {
    try {
      const response = await this.sendRequestForAccess(data);

      if (response.status >= 400) {
        this.setState({ error: response.statusText });
        return;
      }

      this.onSuccess();
    } catch (e) {
      console.debug('Error: ', e);
      this.setState({ error: e.message || 'An error occurred' });
    }
  };

  // does not need authentication
  sendRequestForAccess = (data: Attributes) => {
    return fetch('/api/organization-invite-requests', {
      method: 'POST',
      body: JSON.stringify({ data: { type: 'organization-invite-requests', attributes: data } }),
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
  };

  onSuccess = () => {
    const { history } = this.props;

    history.push(successPath);
  };

  render() {
    const { error } = this.state;

    return <Display onSubmit={this.onSubmit} error={error} />;
  }
}

export default withRouter(RequestAccessForOrganizationRoute);
