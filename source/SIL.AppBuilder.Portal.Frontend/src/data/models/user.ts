import { AttributesObject } from 'jsonapi-typescript';

export const TYPE_NAME = 'user';
export const PLURAL_NAME = 'users';

export interface UserAttributes extends AttributesObject {
  givenName?: string;
  familyName?: string;
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  emailNotification?: boolean;
  sshKey?: string;
  isLocked?: boolean;
  role?: {id: string, name: string}; // need api
  groups?: Array<{id:string, name: string}>; // need an api
  auth0Id?: string;
  profileVisibility?: number;
}


export function name(attrs: UserAttributes) {
  return `${attrs.givenName} ${attrs.familyName}`;
}