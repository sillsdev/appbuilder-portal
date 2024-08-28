import { compose } from 'recompose';
import { withTranslations } from '@lib/i18n';
import { withLoader } from '@data';
import { withError } from '@data/containers/with-error';
import { withPublicProject } from '@data/containers/resources/project/public';

import { IExpectedPropsForRoute } from './types';
import Display from './display';

export const pathName = '/directory/:projectId';

export default compose<IExpectedPropsForRoute, IExpectedPropsForRoute>(
  withTranslations,
  withPublicProject(
    ({
      match: {
        params: { projectId },
      },
    }) => projectId
  ),
  withError('error', ({ error }) => error !== undefined),
  withLoader(({ project }) => !project)
)(Display);
