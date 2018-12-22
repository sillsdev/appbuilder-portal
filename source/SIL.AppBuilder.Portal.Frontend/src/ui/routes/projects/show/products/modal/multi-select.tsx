import * as React from 'react';
import { compose, withProps } from 'recompose';

import { OrganizationResource, ProductDefinitionResource, ProjectResource } from '@data';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps,
} from '@data/containers/resources/project/with-data-actions';

import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';

import { MultiSelect } from '@ui/components/inputs/multi-select';
import { withRelationships } from '@data/containers/with-relationship';

interface INeededProps {
  organization: OrganizationResource;
  selected?: ProductDefinitionResource[];
  project: ProjectResource;
}

interface IPendingUpdates {
  [itemId: string]: boolean;
}

type IProps = INeededProps & IDataActionsProps & i18nProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withDataActions,
  withRelationships(({ organization }: INeededProps) => {
    return {
      list: [organization, 'organizationProductDefinitions', 'productDefinition'],
    };
  }),
  withProps(({ t }: i18nProps) => ({
    selectedItemJoinsWith: 'productDefinition',
    emptyListLabel: t('project.products.popup.empty'),
    displayProductIcon: true,
  }))
)(
  class extends React.Component<IProps> {
    pendingUpdates: IPendingUpdates = {};

    onSelectionChange = async (item: ProductDefinitionResource) => {
      if (!this.pendingUpdates[item.id]) {
        this.pendingUpdates[item.id] = true;
        const { t, updateProduct } = this.props;
        try {
          await updateProduct(item);
          toast.success(t('updated'));
        } catch (e) {
          toast.error(e.message);
        }
        delete this.pendingUpdates[item.id];
      }
    }

    render() {
      return <MultiSelect {...this.props} onChange={this.onSelectionChange} />;
    }
  }
);
