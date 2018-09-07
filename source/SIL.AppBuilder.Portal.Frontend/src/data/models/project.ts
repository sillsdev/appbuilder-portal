import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'project';
export const PLURAL_NAME = 'projects';

export interface ProjectAttributes extends AttributesObject {
  name: string;
  status: string;
  dateCreated: Date;
  dateArchived: Date;
  language: string;
  type: string;
  description: string;
  automaticRebuild: boolean;
  allowDownload: boolean;
  location: string;
  lastUpdatedAt: Date;
  isPublic: boolean;
  organization: any; // TODO Remove this when API is ready
}
