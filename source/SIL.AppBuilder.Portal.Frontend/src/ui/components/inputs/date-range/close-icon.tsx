import * as React from 'react';
import CloseIcon from '@material-ui/icons/Close';

import { IAttributeProps } from '@lib/dom';

interface IOwnProps {
  onClick: () => void;
}

export default class extends React.PureComponent<IAttributeProps & IOwnProps> {
  render() {
    return (
      <div role='button' { ...this.props }>
        <CloseIcon />
      </div>
    );
  }
}
