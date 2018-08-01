export const TYPE_NAME = 'user';

import { attributesFor } from '../helpers';

import { RoleAttributes } from './role';
import { GroupAttributes } from './group';

export interface UserAttributes {
  givenName?: string;
  familyName?: string;
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  emailNotification?: boolean;
  sshKey?: string;
  isLocked: boolean;
  role?: {id: string, name: string}; // need api
  groups?: Array<{id:string, name: string}>; // need an api
  auth0Id?: string;
  locale: string;
}

export function fromPayload(payload: any): UserAttributes {
  const attrs: any = attributesFor(payload);

  return {
    givenName: attrs['given-name'] as string,
    familyName: attrs['family-name'] as string,
    email: attrs.email as string,
    isLocked: attrs['is-locked'] as boolean,
    locale: attrs.locale as string,
    name: attrs.name as string,
    phone: attrs.phone as string,
    timezone: attrs.timezone as string
  };
}
