import { WithDataProps } from 'react-orbitjs';
import { OrganizationResource } from '@data';

export interface IProvidedProps {
  currentOrganizationId: string | number;
  currentOrganization: OrganizationResource;
}

export interface IWithIntermediateData {
  currentUserOrganizations: OrganizationResource[];
}

export interface IReduxProps {
  currentOrganizationId: string | number;
  setCurrentOrganizationId: (id: string) => void;
}

export type IDataProps = { error?: Error; organization?: OrganizationResource } & WithDataProps;

export type IProps = IProvidedProps & IDataProps & IReduxProps;
