import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

// Don't have API data yet?
// Stub it with this!
export function withStubbedDevData(typeName: string, forcedId: string | number, attributes: any, relationships = {}) {
  const existingKey = `existing-${typeName}-${forcedId}`;
  const mapRecordsToProps = {
    [existingKey]: q => q.findRecord({ id: forcedId, type: typeName })
  };

  return InnerComponent => {
    class WrapperClass extends React.Component<{ existing: any } & WithDataProps, { _data: any }> {
      state = { _data: undefined };

      componentDidMount() {
        const { updateStore, [existingKey]: existing } = this.props;

        // without checking attributes, a record may 'exist'
        // due to a previous record referencing the relationship to this record
        if (existing && existing.attributes) {
          console.debug(`DEV: record already exists`, existing);
          this.setState({ _data: existing });
          return;
        }


        console.debug('DEV: creating stubbed dev data...');

        updateStore(t => t.addRecord({
          type: typeName,
          id: forcedId,
          // remoteId: forcedId,
          attributes,
          relationships
        }), { devOnly: true }).then(data => {
          console.debug('DEV: created:', data);

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
  };
}
