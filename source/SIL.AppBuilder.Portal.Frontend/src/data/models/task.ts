import { UserAttributes } from "@data/models/user";
import { ProjectAttributes } from "@data/models/project";
import { ProductAttributes } from '@data/models/product';

export const TYPE_NAME = 'task';

export interface TaskAttributes {
  project: ProjectAttributes;
  product: ProductAttributes;
  status: string;
  waitTime: number;
  user: UserAttributes;
}
