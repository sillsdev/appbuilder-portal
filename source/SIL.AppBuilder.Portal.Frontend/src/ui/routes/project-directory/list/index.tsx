import * as React from 'react';
import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { withData as withCache } from 'react-orbitjs';
import { setCurrentOrganization } from '@store/data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';
import { TYPE_NAME as PROJECT } from '@data/models/project';
import { withCurrentUserContext } from '@data/containers/with-current-user';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork as withProjects } from '@data/containers/resources/project/list';
import { withPagination, withFiltering } from '@data/containers/api';
import { withSorting } from '@data/containers/api/sorting';
import { withError } from '@data/containers/with-error';
import { withTranslations } from '@lib/i18n';
import { withTableColumns, COLUMN_KEY } from '@ui/components/project-table';

import '@ui/components/project-table/project-table.scss';

import Display from './display';

const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id)),
});

export default compose(
  withTranslations,
  connect(
    null,
    mapDispatchToProps
  ),
  withCurrentUserContext,
  withFiltering(() => ({
    requiredFilters: [{ attribute: 'date-archived', value: 'isnull:' }],
  })),
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withProjects({ all: true }),
  withLoader(({ error, projects }) => !error && !projects),
  withError('error', ({ error }) => error !== undefined),
  withProps(({ projects }) => ({
    projects: projects.filter((resource) => resource.type === PROJECT),
    tableName: 'directory',
  })),
  withCache(() => ({
    organizations: (q) => q.findRecords(ORGANIZATION),
    groups: (q) => q.findRecords(GROUP),
  })),
  withTableColumns({
    tableName: 'directory',
    defaultColumns: [
      COLUMN_KEY.PROJECT_ORGANIZATION,
      COLUMN_KEY.PROJECT_LANGUAGE,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON,
    ],
  })
)(Display);
