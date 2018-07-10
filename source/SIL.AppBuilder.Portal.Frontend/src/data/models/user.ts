export const TYPE_NAME = 'user';

export interface UserAttributes {
  name?: string;
  email?: string;
  timezone?: string;
  localization?: string;
  emailNotification: boolean;
  sshKey: string;
}