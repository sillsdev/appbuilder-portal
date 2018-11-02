import * as React from 'react';

interface IOwnProps {
  condition: boolean;
  label: string;
  className: string;
}

type IProps =
  & IOwnProps;

class Empty extends React.Component<IProps> {

  render() {

    const { children, condition, label, className } = this.props;

    if (!condition) {
      return <div className={className}>{label}</div>;
    }

    return children;

  }

}

export default Empty;