import { withRouter } from 'react-router';

import { query } from '@data';

import { compose, withProps } from 'recompose';
import { paths } from '@ui/routes/admin/paths';

import { useTranslations } from '~/lib/i18n';

import * as toast from '@lib/toast';
import { useDataActions } from '@data/containers/resources/store/use-data-actions';

import { buildOptions, buildFindRecord, withLoader } from '~/data';

import Form from './-components/form';

export default compose(
  withRouter,
  query(({ match: { params: { id } } }) => ({
    store: [(q) => buildFindRecord(q, 'store', id), buildOptions({ include: ['store-type'] })],
  })),
  withLoader(({ store }) => !store),
  withProps(({ history, store }) => {
    const { update } = useDataActions();
    const { t } = useTranslations();

    return {
      async save(attributes, relationships) {
        await update(store, attributes, relationships);

        toast.success(t('models.updateSuccess', { name: t('stores.name') }));

        history.push(paths.settings.stores.path());
      },
      cancel() {
        history.push(paths.settings.stores.path());
      },
    };
  })
)(Form);
