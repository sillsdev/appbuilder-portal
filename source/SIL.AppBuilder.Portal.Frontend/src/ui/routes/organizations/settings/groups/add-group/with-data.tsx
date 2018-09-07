import * as React from 'react';
import * as toast from '@lib/toast';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';

import { GroupAttributes, TYPE_NAME as GROUP } from '@data/models/group';
import { create } from '@data';

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
      const { dataStore } = this.props;

      return await create(dataStore, GROUP, {
        attributes: payload,
        relationships: {
          // TODO: add owner
        }
      });
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
