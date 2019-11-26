import * as React from 'react';
import { compose, withProps } from 'recompose';

import {
  OrganizationResource,
  ProductDefinitionResource,
  ProjectResource,
  attributesFor,
} from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { compareVia } from '@lib/collection';
import { MultiSelect } from '@ui/components/inputs/multi-select';
import { withRelationships } from '@data/containers/with-relationship';
import { withOrbit } from 'react-orbitjs';

interface INeededProps {
  organization: OrganizationResource;
  selected?: ProductDefinitionResource[];
  project: ProjectResource;
  onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
}

interface IPendingUpdates {
  [itemId: string]: boolean;
}

interface IComposedProps {
  selectedItemJoinsWith: string;
  emptyListLabel: string;
  displayProductIcon: boolean;
  list: ProductDefinitionResource[];
}

type IProps = INeededProps & i18nProps & IComposedProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withOrbit(),
  withRelationships(({ organization }: INeededProps) => {
    return {
      list: [organization, 'organizationProductDefinitions', 'productDefinition'],
    };
  }),
  withProps(({ t, list }: IProps) => {
    return {
      selectedItemJoinsWith: 'productDefinition',
      emptyListLabel: t('project.products.popup.empty'),
      displayProductIcon: true,
      list: list.sort(compareVia((pd) => attributesFor(pd).name)),
    };
  })
)(
  class extends React.Component<IProps> {
    pendingUpdates: IPendingUpdates = {};

    onSelectionChange = async (item: ProductDefinitionResource) => {
      if (this.pendingUpdates[item.id]) {
        return;
      }

      this.pendingUpdates[item.id] = true;

      const { onChangeSelection } = this.props;

      await onChangeSelection(item);

      delete this.pendingUpdates[item.id];
    };

    render() {
      const {
        selected,
        t,
        list,
        selectedItemJoinsWith,
        emptyListLabel,
        displayProductIcon,
      } = this.props;

      const selectProps = {
        list,
        selectedItemJoinsWith,
        emptyListLabel,
        displayProductIcon,
        selected,
        t,
        onChange: this.onSelectionChange,
      };

      return <MultiSelect {...selectProps} />;
    }
  }
);
