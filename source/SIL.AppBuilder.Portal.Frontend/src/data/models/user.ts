export const TYPE_NAME = 'user';

import { RoleAttributes } from './role';
import { GroupAttributes } from './group';

export interface UserAttributes {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  localization?: string;
  emailNotification: boolean;
  sshKey: string;
  role?: {id: string, name: string}; // need api
  groups?: Array<{id:string, name: string}>; // need an api
  auth0Id?: string;
}
