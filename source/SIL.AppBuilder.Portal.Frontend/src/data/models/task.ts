import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'task';

export interface TaskAttributes extends AttributesObject {
  status: string;
  waitTime: number;
}
