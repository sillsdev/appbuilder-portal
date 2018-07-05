import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { withRouter, RouterProps } from 'react-router';
import { compose } from 'recompose';

import Display from './display';

export interface IOwnProps { }
export type IProps =
  & IOwnProps
  & WithDataProps
  & RouterProps;

class PictureForm extends React.Component<IProps> {

  update = async () => {
  }

  render() {
    return <Display />;
  }

}

export default compose<{}, IOwnProps>(
  withRouter,
  withData({})
)(PictureForm);