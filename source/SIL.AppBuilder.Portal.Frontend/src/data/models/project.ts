export const TYPE_NAME = 'project';

export interface ProjectAttributes {
  name: string;
  status: string;
  dateCreated: Date;
  dateArchived: Date;
  language: string;
  type: string;
  description: string;
  automaticRebuild: boolean;
  allowOtherToDownload: boolean;
  location: string;
  lastUpdatedAt: Date;
  organization: any; // TODO Remove this when API is ready
}
