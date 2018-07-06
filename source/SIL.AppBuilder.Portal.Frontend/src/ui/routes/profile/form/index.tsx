import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';

import * as toast from '@lib/toast';
import { UserAttributes, TYPE_NAME } from '@data/models/user';

import Display from './display';

export interface IOwnProps { }
export type IProps =
  & IOwnProps
  & WithDataProps
  & RouterProps;

class EditProfileForm extends React.Component<IProps> {

  submit = async (payload: UserAttributes) => {
    try {
      this.update(payload);

      toast.success(`User update successfully`);

    } catch (e) {
      toast.error(e.message);
    }
  }

  update = async (payload: UserAttributes) => {
    const { updateStore } = this.props;

    const { name, email, localization, timezone, emailNotification, sshKey } = payload;

    return await updateStore(t => t.replaceRecord({
      type: TYPE_NAME,
      attributes: { name, email, localization, timezone, emailNotification, sshKey }
    }));
  }  

  render() {
    return <Display onSubmit={this.submit}/>;
  }

}

export default compose<{}, IOwnProps>(
  withRouter,
  withData({})
)(EditProfileForm);