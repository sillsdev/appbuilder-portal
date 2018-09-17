import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { TYPE_NAME as PROJECT } from '@data/models/project';
import { TYPE_NAME as ORGANITZATION } from '@data/models/organization';


export function withRelationship(relationshipName: string) {
  function mapRecordsToProps(passedProps) {
    const { project } = passedProps;

    return {
      [relationshipName]: q => q.findRelatedRecord({ type: PROJECT, id: project.id }, relationshipName)
    };
  }

  return InnerComponent => {
    return withOrbit(mapRecordsToProps)(InnerComponent);
  };
}
