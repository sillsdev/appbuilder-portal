export const TYPE_NAME = 'project';

export interface ProjectAttributes {
  name: string;
  status: string;
  createdOn: Date;
  language: string;
  type: string;
  description: string;
  automaticRebuild: boolean;
  allowOtherToDownload: boolean;
  location: string;
  lastUpdatedAt: Date;
}
