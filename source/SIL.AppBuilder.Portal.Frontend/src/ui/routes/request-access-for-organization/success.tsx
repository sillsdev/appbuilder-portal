import * as React from 'react';

import FocusPanel from '@ui/components/focus-panel';

export const pathName = '/request-access-for-organization/success';

class RequestSuccess extends React.Component {
  render() {
    return (
      <FocusPanel title={'Request Sent!'}>
        An email has been sent to the Scriporia team,
        and you'll receive an invitation after your rquest
        has been reviewed.
      </FocusPanel>
    );
  }
}

export default RequestSuccess;
