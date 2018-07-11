import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

// Don't have API data yet?
// Stub it with this!
export function withStubbedDevData(type: string, forcedId: string, attributes: any) {
  const mapRecordsToProps = {
    existing: q => q.findRecord({ id: forcedId, type })
  };

  return InnerComponent => {
    class WrapperClass extends React.Component<{ existing: any } & WithDataProps, { _data: any }> {
      state = { _data: undefined };

      componentDidMount() {
        const { updateStore, existing } = this.props;

        if (existing) {
          console.log(`DEV: record already exists`, existing);
          this.setState({ _data: existing });
          return;
        }


        console.log('DEV: creating stubbed dev data...');

        updateStore(t => t.addRecord({
          type,
          id: forcedId,
          attributes
        })).then(data => {
          console.log('DEV: created:', data);

          this.setState({ _data: data });
        });
      }

      render() {
        if (this.state._data) {
          return <InnerComponent {...this.props} />;
        } else {
          return 'Creating your stubbed dev data...';
        }
      }
    }

    return compose(
      withData(mapRecordsToProps)
    )(WrapperClass);
  }
}
