import * as React from 'react';
import CloseIcon from '@material-ui/icons/Close';

export default class extends React.PureComponent {
  render() {
    return (
      <div role='button' { ...this.props }>
        <CloseIcon />
      </div>
    );
  }
}
