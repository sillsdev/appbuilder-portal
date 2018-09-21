import { withData as withOrbit } from 'react-orbitjs';
import { TYPE_NAME as PROJECT } from '@data/models/project';


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
