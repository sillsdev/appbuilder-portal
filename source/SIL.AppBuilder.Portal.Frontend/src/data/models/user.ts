export const TYPE_NAME = 'user';

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
  isLocked?: boolean;
  role?: {id: string, name: string}; // need api
  groups?: Array<{id:string, name: string}>; // need an api
  auth0Id?: string;
  profileVisibility?: number;
}

