import { OrganizationResource } from '@data';
import { IProvidedProps as IDataProps } from './with-data';

export interface IOwnProps {
  selected: string;
  onChange: (userId: string) => void;
  disableSelection?: boolean;
  groupId: string;
  restrictToGroup: boolean;
  scopeToOrganization?: OrganizationResource;
}

export type IProps =
& IOwnProps
& IDataProps;
