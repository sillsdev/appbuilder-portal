import * as React from 'react';
import { titleize } from 'inflected';
import Down from '@material-ui/icons/ArrowDropDown';
import Up from '@material-ui/icons/ArrowDropUp';


import ProductIcon from '@ui/components/product-icon';
import {
  ProductDefinitionResource,
  ProductArtifactResource,
  attributesFor
} from '@data';
import { i18nProps } from '@lib/i18n';

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  artifacts: ProductArtifactResource[];
  onClick: () => void;
  isCollapsed: boolean;
}

type IProps =
  & IOwnProps
  & i18nProps;

function humanReadableName(productDefinition) {
  const { name } = attributesFor(productDefinition);

  return titleize(name);
}

export default class Header extends React.Component<IProps> {
  render() {
    const {
      productDefinition, artifacts, t,
      isCollapsed, onClick,
    } = this.props;

    return (
      <div data-test-artifact-header role='button' onClick={onClick} className='header flex align-items-center p-md bold justify-content-space-between'>
        <span className='flex align-items-center'>
          <ProductIcon product={productDefinition} selected={true}/>
          <span
            data-test-project-files-product-name
            className='m-l-sm'
          >
            {humanReadableName(productDefinition)}
          </span>
        </span>
        <span data-test-count className='flex align-items-center'>
          {t('project.products.numArtifacts', { amount: artifacts.length })}

          {isCollapsed ? <Up /> : <Down />}
        </span>
      </div>
    );
  }
}