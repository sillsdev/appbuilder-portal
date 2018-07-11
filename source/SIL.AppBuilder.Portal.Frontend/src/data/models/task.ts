import { UserAttributes } from "@data/models/user";

export const TYPE_NAME = 'task';

export interface TaskAttributes {
  project: String;
  product: String;
  status: String;
  waitTime: number;
  user: UserAttributes;
}