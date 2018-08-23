import * as React from 'react';

import { relationshipFor } from '@data/helpers';


export function withRelationship(targetProperty: string, relationshipName: string, propertyName?: string) {
  return WrappedComponent => {
    return props => {
      const target = props[targetProperty];
      const relationship = relationshipFor(target, relationshipName);

      const nextProps = {
        ...props,
        [propertyName || relationshipName]: relationship
      };

      return <WrappedComponent { ...nextProps } />;
    }
  }
}

export function withRelationshipData(targetProperty: string, relationshipName: string, propertyName?: string) {
  // TODO: implement this

}
