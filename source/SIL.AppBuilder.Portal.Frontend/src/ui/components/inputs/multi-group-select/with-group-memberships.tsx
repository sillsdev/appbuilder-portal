import { withData as withOrbit } from 'react-orbitjs';
import { TYPE_NAME as USER } from '@data/models/user';

export function withGroupMemberships() {

  function mapRecordsToProps(passedProps) {
    const { user } = passedProps;

    return {
      userGroupMemberships: q => q.findRelatedRecords({ type: USER, id: user.id},'groupMemberships')
    };
  }

  return InnerComponent => {
    return withOrbit(mapRecordsToProps)(InnerComponent);
  }
}