import * as React from 'react';
import Store from '@orbit/store';
import { compose, withProps } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { assert } from '@orbit/utils';

interface MapFnResult {
  [propKey: string]: [any, string, string];
}

interface IState {
  isLoading: boolean;
  error?: any;
  result: object;
}

// NOTE: all relationships should already be fetched / in the cache
//
// example:
//
// withRelationships((props) => {
//   const { currentUser, currentOrganization } = props;
//
//   return {
//     // many-to-many
//     organizations: [currentUser, 'organizationMemberships', 'organizations'],
//     groups: [currentUser, GROUP_MEMBERSHIPS, GROUPS],
//
//     // has-many
//     ownedProjects: [currentUser, 'projects'],
//
//     // has-one / belongs-to
//     organizationOwner: [currentOrganization, 'owner']
//
//   }
// })
export function withRelationships<T>(mappingFn: (props: T) => MapFnResult) {
  return (WrappedComponent) => {
    class WithRelationship extends React.PureComponent<T & MapFnResult & WithDataProps, IState> {
      state = { isLoading: false, error: undefined, result: {} };
      isFetchingRelationships = false;

      fetchRelationships = (): object => {
        const { dataStore, relationshipsToFind } = this.props;

        const resultingRelationshipProps = {};

        const promises = Object.keys(relationshipsToFind).map((resultKey) => {
          const relationshipArgs = relationshipsToFind[resultKey];

          const relation = retrieveRelation(dataStore, relationshipArgs);

          resultingRelationshipProps[resultKey] = relation;
        });

        // try {
        //   await Promise.all(promises);
        // } catch (e) {
        //   this.setState({ error: e });
        // }

        return resultingRelationshipProps;
      };

      asyncStarter = () => {
        if (this.isFetchingRelationships) {
          return;
        }
        if (this.state.isLoading) {
          return;
        }

        try {
          this.isFetchingRelationships = true;
          this.setState({ isLoading: true, error: undefined }, () => {
            const result = this.fetchRelationships();

            this.setState({ result, isLoading: false, error: undefined }, () => {
              this.isFetchingRelationships = false;
            });
          });
        } catch (error) {
          this.setState({ isLoading: false, error }, () => {
            this.isFetchingRelationships = false;
          });
        }
      };

      // componentDidMount() {
      //   this.asyncStarter();
      // }

      constructor(props){
        super(props);

        const result = this.fetchRelationships();
        this.state = { result, isLoading: false, error: undefined };
      }

      componentDidUpdate() {
        this.asyncStarter();
      }

      render() {
        const { result, isLoading, error } = this.state;
        const nextProps = {
          ...(this.props as object),
          ...(result || {}),
          isLoading,
          error,
        };

        return <WrappedComponent {...nextProps} />;
      }
    }

    return compose(
      withProps((props: T) => {
        const mapResult = mappingFn(props);

        return {
          relationshipsToFind: mapResult,
        };
      }),
      withOrbit({})
    )(WithRelationship);
  };
}

type RelationshipArgs = [ResourceObject, string, string] | [ResourceObject, string];

export function retrieveRelation(dataStore: Store, relationshipArgs: RelationshipArgs) {
  const sourceModel = relationshipArgs[0];
  const relationshipPath = relationshipArgs.slice(1) as [string, string] | [string];

  if (relationshipPath.length === 2) {
    return retrieveManyToMany(dataStore, sourceModel, relationshipPath);
  }

  return retriveDirectRelationship(dataStore, sourceModel, relationshipPath[0]);
}

function retrieveManyToMany(
  dataStore: Store,
  sourceModel: ResourceObject,
  relationshipPath: [string, string]
) {
  const [joinRelationship, targetRelationship] = relationshipPath;

  assert(
    `sourceModel in call to retrieveManyToMany is undefined when trying to access ${relationshipPath.join(
      '.'
    )}`,
    sourceModel !== undefined
  );

  const joins = dataStore.cache.query((q) => q.findRelatedRecords(sourceModel, joinRelationship));

  // for each join record....
  const targets = [];
  const promises = joins.map((joinRecord) => {
    const target = dataStore.cache.query((q) =>
      q.findRelatedRecord(joinRecord, targetRelationship)
    );

    targets.push(target);
  });

  // await Promise.all(promises);

  return targets;
}

async function retriveDirectRelationship(
  dataStore: Store,
  sourceModel: ResourceObject,
  relationshipName: string
) {
  // TODO: add detection for hasOne vs hasMany, via lookup of the schema from dataStore
  throw new Error('not implemented');
}
