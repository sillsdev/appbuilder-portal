import * as React from 'react';

export const pathName = '/not-found';

export default class CreateOrganizationRoute extends React.Component {
  render() {
    return (
      <div className='ui text container'>
        <h1 className='ui header'>Not Found!</h1>
        <div className='content'>
          Something went wrong and the page or resource could not be found!
        </div>
      </div>
    );
  }
}
