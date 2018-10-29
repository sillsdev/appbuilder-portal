import * as React from 'react';

import { relationshipFor } from '@data/helpers';

interface MapFnResult {
  [propKey: string]: [any, string, string];
}


// example:
//
// withRelationships((props) => {
//   const { currentUser } = props;
//
//   return {
//     organizations: [currentUser, 'organizationMemberships', 'organizations'],
//     groups: [currentUser, GROUP_MEMBERSHIPS, GROUPS]
//   }
// })
export function withRelationships<T>(mappingFn: (props: T) => MapFnResult) {
  return WrappedComponent => {
    return props => {
      const mapResult = mappingFn(props);

      const resultingRelationshipProps = {};

      Object.keys(mapResult).forEach(resultKey => {

      });

      const nextProps = {
        ...props,
        [propertyName || relationshipName]: relationship
      };

      return <WrappedComponent { ...nextProps } />;
    };
  };
}

export function withRelationshipData(targetProperty: string, relationshipName: string, propertyName?: string) {
  // TODO: implement this

}

