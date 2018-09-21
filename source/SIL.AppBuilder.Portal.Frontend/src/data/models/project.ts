import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type PROJECTS_TYPE = 'projects';

export const TYPE_NAME = 'project';
export const PLURAL_NAME = 'projects';

export interface ProjectAttributes extends AttributesObject {
  name: string;
  status: string;
  dateCreated: string;
  dateArchived: string;
  language: string;
  type: string;
  description: string;
  automaticBuilds: boolean;
  allowDownloads: boolean;
  location: string;
  lastUpdatedAt: string;
  isPublic: boolean;
  organization: any; // TODO Remove this when API is ready
}

export type ProjectResource = ResourceObject<PROJECTS_TYPE, ProjectAttributes>;