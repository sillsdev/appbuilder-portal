import { withRouter } from 'react-router';
import { compose, withProps } from 'recompose';
import { paths } from '@ui/routes/admin/paths';

import { useTranslations } from '~/lib/i18n';

import * as toast from '@lib/toast';
import { useDataActions } from '@data/containers/resources/store/use-data-actions';

import Form from './-components/form';

export default compose(
  withRouter,
  withProps(({ history }) => {
    const { create } = useDataActions();
    const { t } = useTranslations();

    return {
      async save(attributes, relationships) {
        await create(attributes, relationships);

        toast.success(t('models.createSuccess', { name: t('stores.name') }));

        history.push(paths.settings.stores.path());
      },
      cancel() {
        history.push(paths.settings.stores.path());
      },
    };
  })
)(Form);
