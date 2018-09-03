import { withData as withOrbit } from 'react-orbitjs';
import { TYPE_NAME as USER } from '@data/models/user';

export function withGroups() {

  function mapRecordsToProps(passedProps) {
    const { user } = passedProps;

    return {
      groups: q => q.findRelatedRecords({ type: USER, id: user.id},'groupMemberships')
    };
  }

  return InnerComponent => {
    return withOrbit(mapRecordsToProps)(InnerComponent);
  }
}