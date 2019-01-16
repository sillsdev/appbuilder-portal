import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type TASKS_TYPE = 'tasks';

export const TYPE_NAME = 'task';

export interface TaskAttributes extends AttributesObject {
  activityName: string;
  comment: string;
  dateCreated: string;
  dateUpdated: string;
  status: string;
  waitTime: number;
}

export type TaskResource = ResourceObject<TASKS_TYPE, TaskAttributes>;
