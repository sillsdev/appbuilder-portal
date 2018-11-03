import { compose, withProps } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import { MultiSelect } from '@ui/components/inputs/multi-select';
import { OrganizationResource, ProductDefinitionResource } from '@data';
import { withRelationships } from '@data/containers/with-relationship';

interface IOwnProps {
  organization: OrganizationResource;
  onChange: (item: ProductDefinitionResource) => void;
}

export default compose(
  withTranslations,
  withRelationships(({ organization }: IOwnProps) => {
    return {
      list: [organization, 'organizationProductDefinitions', 'productDefinition']
    };
  }),
  withProps(({ t }: i18nProps) => ({
    selectedItemJoinsWith: 'productDefinition',
    emptyListLabel: t('project.products.popup.empty'),
    displayProductIcon: true,
  }))
)(MultiSelect);
