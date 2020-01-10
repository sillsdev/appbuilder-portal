import * as React from 'react';
import { compose, withProps } from 'recompose';

import {
  OrganizationResource,
  ProductDefinitionResource,
  ProjectResource,
  ProductResource,
  attributesFor,
} from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { MultiSelect } from '@ui/components/inputs/multi-select';
import { withOrbit } from 'react-orbitjs';

interface INeededProps {
  organization: OrganizationResource;
  selected?: ProductResource[];
  project: ProjectResource;
  list: ProductDefinitionResource[];
  onChangeSelection: (definition: ProductDefinitionResource) => Promise<void>;
  selectedOnly?: boolean;
  unselectedOnly?: boolean;
}

interface IPendingUpdates {
  [itemId: string]: boolean;
}

interface IComposedProps {
  selectedItemJoinsWith: string;
  emptyListLabel: string;
  displayProductIcon: boolean;
}

type IProps = INeededProps & i18nProps & IComposedProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withOrbit(),
  withProps(({ t }: IProps) => {
    return {
      selectedItemJoinsWith: 'productDefinition',
      emptyListLabel: t('project.products.popup.empty'),
      displayProductIcon: true,
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
        selectedOnly,
        unselectedOnly,
      } = this.props;

      const selectProps = {
        list,
        selectedItemJoinsWith,
        emptyListLabel,
        displayProductIcon,
        selected,
        t,
        onChange: this.onSelectionChange,
        selectedOnly,
        unselectedOnly,
      };

      return <MultiSelect {...selectProps} />;
    }
  }
);
