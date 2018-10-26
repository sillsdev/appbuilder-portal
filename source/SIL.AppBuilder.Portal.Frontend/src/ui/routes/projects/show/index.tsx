import { compose } from 'recompose';
import { match as Match } from 'react-router';

import { ProjectResource } from '@data';
import { ROLE, withRole } from '@data/containers/with-role';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withMomentTimezone, IProvidedProps as ITimeProps } from '@lib/with-moment-timezone';

import { withAccessRestriction } from './with-access-restriction';
import { withData } from './with-data';
import { withProjectOperations } from './with-project-operations';

import Display from './display';

import './project.scss';

export const pathName = '/projects/:id';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
  toggleArchiveProject: (project: ProjectResource) => void;
}

interface QueriedProps {
  project: ProjectResource;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & i18nProps
  & ITimeProps;

export default compose(
  withTranslations,
  withMomentTimezone,
  withData,
  withProjectOperations,
  // todo - extract this to a more general thing?
  withAccessRestriction,
  /* withRole(ROLE.OrgAdmin, { */
  /*   redirectTo: '/', */
  /*   checkOrganizationOf: ({ project }) => project */
  /* }), */
)(Display);
