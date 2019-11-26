import * as React from 'react';
import Store from '@orbit/store';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit } from 'react-orbitjs';
import { Record } from '@orbit/data';
import { assert } from '@orbit/utils';

type RelationshipArgs = [ResourceObject, string, string] | [ResourceObject, string];

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
export function withRelationships<TWrappedProps, TResultProps>(
  mappingFn: (props: TWrappedProps) => { [K in keyof TResultProps]: RelationshipArgs }
) {
  type KeyConstraint = { [K in keyof TResultProps]: RelationshipArgs };

  return (WrappedComponent) =>
    withOrbit<TWrappedProps, {}>()((props) => {
      const relationshipsToFind = mappingFn(props);
      const relations = findRelationships<KeyConstraint, TResultProps>(
        props.dataStore,
        relationshipsToFind
      );

      return <WrappedComponent {...props} {...relations} />;
    });
}

function findRelationships<TRelationships, TResult>(
  dataStore: Store,
  relationshipsToFind: TRelationships
) {
  const result = {};

  Object.keys(relationshipsToFind).forEach((resultKey) => {
    const relationshipArgs = relationshipsToFind[resultKey];

    const relation = retrieveRelation(dataStore, relationshipArgs);

    result[resultKey] = relation;
  });

  return result as TResult;
}

export function retrieveRelation(dataStore: Store, relationshipArgs: RelationshipArgs) {
  const sourceModel = relationshipArgs[0];
  const relationshipPath = relationshipArgs.slice(1) as [string, string] | [string];

  if (relationshipPath.length === 2) {
    return retrieveManyToMany(dataStore, sourceModel, relationshipPath);
  }

  return retrieveDirectRelationship(/*dataStore, sourceModel, relationshipPath[0]*/);
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

  return joins.map((joinRecord) => {
    return dataStore.cache.query((q) => q.findRelatedRecord(joinRecord, targetRelationship));
  });
}

async function retrieveDirectRelationship() {
  /*
  This would be the expected declaration and parameter list if implemented:
  async function retrieveDirectRelationship(
    dataStore: Store,
    sourceModel: ResourceObject,
    relationshipName: string
  ) {
  */
  // TODO: add detection for hasOne vs hasMany, via lookup of the schema from dataStore
  throw new Error('not implemented');
}

export function relationsFromPath(
  dataStore: Store,
  sourceModel: Record,
  relationshipPath: string[]
) {
  let segment;
  let model = sourceModel;
  let models = [];

  for (let i = 0; i < relationshipPath.length; i++) {
    segment = relationshipPath[i];
    assert(`can't access segment (${segment}) on falsey model.`, !!model);

    model = dataStore.cache.query((q) => q.findRelatedRecord(model, segment));
    models.push(model);
  }

  return models;
}
