import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import ProductIcon from '@ui/components/product-icon';
import {
  ProductDefinitionResource,
  ProductArtifactResource,
  ProductResource,
  ProductBuildResource,
  attributesFor
} from '@data';
import Artifact from './artifact';
import EmptyLabel from '@ui/components/labels/empty';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import ResourceSelect from '@ui/components/inputs/resource-select';

import Artifacts from './artifacts';

interface IExpectedProps {
  product: ProductResource;
}

interface IOwnProps {
  productBuilds: ProductBuildResource[];
}

interface IState {
  activeVersion: boolean;
}

type IProps =
  & IOwnProps
  & i18nProps;

class Builds extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    const { productBuilds } = props;

    this.state = {
      activeVersion: productBuilds[0]
    };
  }

  changeSelectedBuild = (productBuild) => {
    this.setState({ activeVersion: productBuild });
  }

  render() {
    const { artifacts, t, product, productBuilds } = this.props;
    const { activeVersion } = this.state;

    return (
      <div data-test-build>
        <ResourceSelect
          items={productBuilds}
          labelField={'version'}
          value={activeVersion}
          onChange={this.changeSelectedBuild}
        />

        <Artifacts
          product={product}
          productBuild={activeVersion}
        />
      </div>
    );

  }

}

export default compose<IProps, IExpectedProps>(
  withTranslations,
  withOrbit((passedProps: IExpectedProps) => {
    const { product } = passedProps;

    return {
      productBuilds: q => q.findRelatedRecords(product, 'productBuilds'),
    };
  })
)(Builds);
