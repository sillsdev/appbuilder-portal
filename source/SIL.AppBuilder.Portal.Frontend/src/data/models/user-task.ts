import { Record } from '@orbit/data';
import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type USER_TASK_TYPE = 'userTask';
export const TYPE_NAME = 'user-task';

export interface UserTaskAttributes extends AttributesObject {
  activityName: string;
  comment: string;
  status: string;
  dateCreated: string;
  dateUpdated: string;
  waitTime: number;
}

export type UserTaskResource = ResourceObject<USER_TASK_TYPE, UserTaskAttributes> & Record;
