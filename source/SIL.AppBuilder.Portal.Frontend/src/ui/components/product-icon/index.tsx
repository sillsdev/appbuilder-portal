import * as React from 'react';
import AndriodIcon from '@material-ui/icons/Android';
import WebIcon from '@material-ui/icons/Web';
import MissingIcon from '@material-ui/icons/ErrorOutline';

import { attributesFor } from '@data';
import { ProductDefinitionResource, ProductResource } from '@data';

const colorStyles = {
  android: { color: '#a4c639' },
  html: { color: '#f5a623' }
};

const DEFAULT_COLOR = { color: '#9b9b9b' };

const iconMap = {
  android: (selected) => <AndriodIcon style={selected ? colorStyles.android : DEFAULT_COLOR} />,
  html: (selected) => <WebIcon style={selected ? colorStyles.html : DEFAULT_COLOR} />,
  [undefined]: () => <MissingIcon />
};

// TODO: We need to change this to product definition
export interface IProps {
  product: ProductDefinitionResource | ProductResource;
  selected?: boolean;
}

export default class ProductIcon extends React.Component<IProps> {

  render() {

    const { product, selected } = this.props;

    const { name } = attributesFor(product);
    const lowerName = name && name.toLowerCase();
    const closestKey = Object.keys(iconMap)
      .find(key => lowerName && lowerName.includes(key));

    return iconMap[closestKey](selected) || <WebIcon />;
  }
}
