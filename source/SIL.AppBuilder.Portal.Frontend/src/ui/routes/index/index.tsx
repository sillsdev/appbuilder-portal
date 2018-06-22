import * as React from 'react';
import { DWKitForm } from 'vendor/dwkit/optimajet-form';
import { get } from '@lib/fetch';

console.log(DWKitForm);
export const pathName = '/';

export default class IndexRoute extends React.Component {
  state = { data: {}, errors: {} };

  async componentDidMount() {
    const response = await get('/ui/login');
    console.log(response);
  }

  render() {
    return (
      <div>
        <h2>Index Route </h2>

        <DWKitForm
          eventFunc={console.log}
          formName='login'
          modelurl='/ui/login'
          data={this.state.data}
          errors={this.state.errors}
        />
      </div>
    );
  }
}
