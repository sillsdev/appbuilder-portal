import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { withTranslations, i18nProps } from '@lib/i18n';

import { MultiSelect } from '@ui/components/inputs/multi-select';
import { OrganizationResource, ProductDefinitionResource } from '@data';

interface IOwnProps {
  organization: OrganizationResource;
  onChange: (item: ProductDefinitionResource) => void;
}

type IProps =
  & IOwnProps
  & i18nProps
  & WithDataProps;

function withData(WrapperComponent) {

  class DataWrapper extends React.Component<IProps> {

    state = {
      list: null
    };

    loadData = async () => {

      const { dataStore, organization } = this.props;

      const opds = await dataStore.cache.query(q => q.findRelatedRecords(organization, 'organizationProductDefinitions'));
      const promises = opds.map(opd => dataStore.cache.query(q => q.findRelatedRecord(opd, 'productDefinition')));
      const productDefinitions = await Promise.all(promises);

      this.setState({ list: productDefinitions });
    }

    componentDidMount() {
      const { list } = this.state;

      if (!list) {
        this.loadData();
      }
    }

    render() {
      const { list } = this.state;
      const { t, onChange } = this.props;

      const componentProps = {
        list,
        selectedItemJoinsWith: 'productDefinition',
        emptyListLabel: t('project.products.popup.empty'),
        displayProductIcon: true,
        onChange,
        ...this.props
      };

      return <WrapperComponent {...componentProps}/>;
    }

  }

  return compose(
    withOrbit({}),
    withTranslations
  )(DataWrapper);

}

export default compose(
  withData
)(MultiSelect);