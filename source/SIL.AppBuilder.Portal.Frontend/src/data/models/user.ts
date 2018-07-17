export const TYPE_NAME = 'user';

export interface UserAttributes {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  localization?: string;
  emailNotification: boolean;
  sshKey: string;
  auth0Id?: string;
}
