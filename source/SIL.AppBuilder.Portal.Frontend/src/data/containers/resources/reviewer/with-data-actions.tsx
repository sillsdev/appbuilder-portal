import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { defaultOptions, REVIEWERS_TYPE } from '@data';
import { ReviewerAttributes } from '@data/models/reviewer';


export interface IProvidedProps {
  createRecord: (attrs: ReviewerAttributes, relationships) => any;
  removeRecord: () => any;
  updateAttribute: (attribute: string, value: any) => any;
  updateAttributes: (attrs: ReviewerAttributes) => any;
}

interface IOwnProps {
  reviewer: ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withDataActions<T>(WrappedComponent) {

  class ReviewerDataActionWrapper extends React.Component<IProps & T> {

    createRecord = async (attributes: ReviewerAttributes, relationships) => {

      const { dataStore } = this.props;

      await dataStore.update(
        q => q.addRecord({
          type: 'reviewer',
          attributes,
          relationships
        }),
        defaultOptions()
      );
    }

    removeRecord = async () => {

      const { reviewer, dataStore } = this.props;

      await dataStore.update(
        q => q.removeRecord({
          type: 'reviewer', id: reviewer.id
        }),
        defaultOptions()
      );
    }

    updateAttribute = async (attribute: string, value: any) => {
      const { reviewer, dataStore } = this.props;

      await dataStore.update(
        q => q.replaceAttribute(reviewer, attribute, value),
        defaultOptions()
      );

      this.forceUpdate();
    }

    updateAttributes = (attributes: ReviewerAttributes) => {
      const { reviewer, updateStore } = this.props;
      const { id, type } = reviewer;

      return updateStore(q => q.replaceRecord({
        id, type, attributes
      }), defaultOptions());
    }

    render() {

      const actionProps = {
        createRecord: this.createRecord,
        removeRecord: this.removeRecord,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }
  }

  return withOrbit({})(ReviewerDataActionWrapper);
}
