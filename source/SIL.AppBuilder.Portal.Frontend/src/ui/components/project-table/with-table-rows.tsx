import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';

interface IProps {
  tableName: string;
}

export function withTableRows(props: IProps) {

  function mapStateToProps({ data }) {
    return {};
  }

  function mapDispatchToProps(dispatch) {
    return {

    };
  }

  return InnerComponent => {

    class WrapperComponent extends React.Component {

      render() {
        console.log(this.props);
        return <InnerComponent {...this.props} />;
      }
    }

    return compose(
      connect(mapStateToProps, mapDispatchToProps)
    )(WrapperComponent);

  };

}