import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProductResource, ProductBuildResource, attributesFor } from '@data';

import { compareVia } from '@lib/collection';
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
  activeVersion: ProductBuildResource;
}

type IProps = IOwnProps & i18nProps;

class Builds extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    const { productBuilds } = props;
    this.state = {
      activeVersion: productBuilds[0],
    };
  }

  changeSelectedBuild = (productBuild) => {
    this.setState({ activeVersion: productBuild });
  };

  render() {
    const { t, product, productBuilds, productDefinition } = this.props;
    const { activeVersion } = this.state;
    const sortedBuilds = productBuilds.sort(compareVia((build) => attributesFor(build).version));

    return (
      <div data-test-build>
        <ResourceSelect
          items={sortedBuilds}
          labelField={(build: ProductBuildResource) => {
            const version = attributesFor(build).version;

            if (build === sortedBuilds[0]) {
              return t('projects.latestBuild', { version });
            }

            return version;
          }}
          value={activeVersion}
          onChange={this.changeSelectedBuild}
          className='is-large p-b-md'
          noResourcesLabel={t('projects.noBuilds')}
        />
        <Artifacts product={product} productBuild={activeVersion} />
      </div>
    );
  }
}

export default compose<IProps, IExpectedProps>(
  withTranslations,
  withOrbit((passedProps: IExpectedProps) => {
    const { product } = passedProps;

    return {
      productBuilds: (q) => q.findRelatedRecords(product, 'productBuilds'),
    };
  })
)(Builds);
