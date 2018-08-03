import * as React from 'react';
import * as toast from '@lib/toast';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

import { GroupAttributes, TYPE_NAME } from '@data/models/group';

export function withData(InnerComponent) {
  class DataWrapper extends React.Component {
    onSubmit = async (payload: GroupAttributes) => {
      try {
        await this.create(payload);
      } catch (e) {
        toast.error(e);
      }
    }

    create = async (payload: GroupAttributes) => {
      const { updateStore } = this.props;

      return await updateStore(t => t.addRecord({
        type: TYPE_NAME,
        attributes: payload
      }));
    }


    render() {
      const dataProps = {
        onSubmit: this.onSubmit
      };

      return <InnerComponent { ...this.props } { ...dataProps } />;
    }
  }

  return withOrbit({})(DataWrapper);
}
