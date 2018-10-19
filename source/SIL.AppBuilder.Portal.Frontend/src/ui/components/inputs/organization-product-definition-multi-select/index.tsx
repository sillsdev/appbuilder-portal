
import { compose, withProps } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { withTranslations } from '@lib/i18n';
import {
  withNetwork as withOrganizationProductDefinitions
} from '@data/containers/resources/organization-product-definition/list';

import { withLoader } from '@data/containers/with-loader';

import { MultiSelect } from '@ui/components/inputs/multi-select';

export default compose(
  withTranslations,
  withOrganizationProductDefinitions(),
  withLoader(({ error, organizationProductDefinitions }) => !error && !organizationProductDefinitions),
  withCache((passedProps) => {
    const { organizationProductDefinitions } = passedProps;
    return {
      productDefinitions: q => organizationProductDefinitions.map(opd => q.findRelatedRecord(opd,'productDefinition'))
    };
  }),
  withProps(({ productDefinitions, t }) => ({
    list: productDefinitions,
    selectedItemJoinsWith: 'productDefinition',
    emptyListLabel: t('org.noproducts')
  })),
)(MultiSelect);