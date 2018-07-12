import * as React from 'react';
import { compose } from 'recompose';
// import { DWKitForm } from 'vendor/dwkit/optimajet-form';
import { get } from '@lib/fetch';
import { withLayout } from '@ui/components/layout';

export const pathName = '/';

class IndexRoute extends React.Component<any, any> {
  state = { data: {}, errors: {} };

  async componentDidMount() {
    // const response = await get('/ui/login');
    // console.log('data back from /ui/login', response);
  }

  render() {
    return (
      <div>
        <h2>Example Form</h2>

        (Form Commented out)
        {/* <DWKitForm
          eventFunc={console.log}
          formName='login'
          modelurl='/ui/login'
          data={this.state.data}
          errors={this.state.errors}
        /> */}
      </div>
    );
  }
}

export default compose (
  withLayout
)(IndexRoute);
