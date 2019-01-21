import * as React from 'react';

import { OrganizationResource, ProjectResource, ProductResource } from '@data';

import ProductSelectionModal from './modal';

interface INeededProps {
  organization: OrganizationResource;
  project: ProjectResource;
  selected: ProductResource[];
}

class SelectionManager extends React.Component<INeededProps> {
  render() {
    return (
      <ProductSelectionModal { ...this.props }/>
    );
  }
}

export default SelectionManager;
