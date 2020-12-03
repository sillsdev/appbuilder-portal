import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { every } from 'lodash';

import { useTranslations } from '~/lib/i18n';

import { useRouter } from '~/lib/hooks';

import * as toast from '~/lib/toast';

import { PROJECT_ROUTES } from './routes';

import { rowSelectionsFor } from '~/redux-store/data/selectors';

import { withBulkActions } from '~/data/containers/resources/project/with-bulk-actions';

import { BulkProductSelection } from './bulk-product-selection';

import { canUserArchive } from '~/data/containers/resources/project/permissions';

import { useOrbit } from 'react-orbitjs';

import { useCurrentUser } from '~/data/containers/with-current-user';

interface IExpectedProps {
  afterBulkAction: () => void;
  tableName: string;
}

export const BulkButtons = withBulkActions<IExpectedProps>(function BulkButtons({
  tableName,
  afterBulkAction,
  bulkArchive,
  bulkReactivate,
}) {
  const { t } = useTranslations();
  const { location } = useRouter();
  const reduxState = useSelector(x => x);
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const selectedRows = rowSelectionsFor(reduxState, tableName);

  const isInOrganizationProject = location.pathname.endsWith(PROJECT_ROUTES.ORGANIZATION);
  const isInOwnProject = location.pathname.endsWith(PROJECT_ROUTES.OWN);
  const isInArchivedProject = location.pathname.endsWith(PROJECT_ROUTES.ARCHIVED);
  const isInActiveProject = isInOrganizationProject || isInOwnProject;
  const canArchiveOrReactivate = every(selectedRows, (row) =>
    canUserArchive(dataStore, currentUser, row)
  );

  const onBulkArchive = useCallback(async () => {
    try {
      await bulkArchive(selectedRows);
      toast.success('Selected projects archived');
    } catch (e) {
      toast.error(e);
    }
    afterBulkAction();
  }, [afterBulkAction, bulkArchive, selectedRows]);

  const onBulkReactivate = useCallback(async () => {
    try {
      await bulkReactivate(selectedRows);
      toast.success('Selected projects reactivated');
    } catch (e) {
      toast.error(e);
    }
    afterBulkAction();
  }, [afterBulkAction, bulkReactivate, selectedRows]);

  return (
    <>
      {isInActiveProject && canArchiveOrReactivate ? (
        <button
          disabled={selectedRows.length === 0}
          data-test-archive-button
          className='ui button basic blue m-r-md'
          onClick={onBulkArchive}
        >
          {t('common.archive')}
        </button>
      ) : null}
      {isInArchivedProject && canArchiveOrReactivate ? (
        <button
          data-test-reactivate-button
          disabled={selectedRows.length === 0}
          className='ui button basic blue m-r-md'
          onClick={onBulkReactivate}
        >
          {t('common.reactivate')}
        </button>
      ) : null}
      <BulkProductSelection disabled={selectedRows.length === 0} tableName={tableName} />
    </>
  );
});
