import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import { RequestAccessForOrganizationAttributes as Attributes } from '@data/models/organization-invite';

import Display from './display';
import { pathName as successPath } from './success';

export const pathName = '/request-access-for-organization';

export type IProps =
  & {}
  & RouteComponentProps<{}>;

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
      console.log(e);
      this.setState({ error: e.message || 'An error occurred' });
    }
  }

  // does not need authentication
  sendRequestForAccess = (data: Attributes) => {
    return fetch('/url-tbd', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  onSuccess = () => {
    const { history } = this.props;

    history.push(successPath);
  }

  render() {
    const { error } = this.state;

    return <Display onSubmit={this.onSubmit} error={error} />
  }
}

export default compose(
  withRouter
)(RequestAccessForOrganizationRoute);
