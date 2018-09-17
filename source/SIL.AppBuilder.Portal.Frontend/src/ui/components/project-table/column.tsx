import * as React from 'react';

export interface IOwnProps {
  value: string;
  className?: string;
  style?: object;
  display: boolean;
}

class Column extends React.Component<IOwnProps> {

  render() {

    const { value, className, display, style } = this.props;

    const columnClassName = className ? className : 'col d-xs-none d-md-block';

    return display &&
      <div
        data-test-project-table-column
        className={columnClassName}
        style={style}
      >
        {value}
      </div>;
  }

}

export default Column;