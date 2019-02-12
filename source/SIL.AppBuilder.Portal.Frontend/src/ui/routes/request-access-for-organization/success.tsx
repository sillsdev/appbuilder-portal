import * as React from 'react';
import FocusPanel from '@ui/components/focus-panel';

class RequestSuccess extends React.Component {
  render() {
    return (
      <FocusPanel title={'Request Sent!'}>
        <p>
          An email has been sent to the Scriporia team, <br />
          and you'll receive an invitation after your request <br />
          has been reviewed.
        </p>
      </FocusPanel>
    );
  }
}

export default RequestSuccess;
