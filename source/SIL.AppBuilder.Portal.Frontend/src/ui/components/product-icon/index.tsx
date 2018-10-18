import * as React from 'react';
import AndriodIcon from '@material-ui/icons/Android';
import WebIcon from '@material-ui/icons/Web';
import MissingIcon from '@material-ui/icons/ErrorOutline';

import { attributesFor } from '@data';
import { ProductDefinitionResource, ProductResource } from '@data';

const colorStyles = {
  android: { color: '#a4c639' },
  html: { color: '#f5a623' }
}

const iconMap = {
  android: () => <AndriodIcon style={colorStyles.android} />,
  html: () => <WebIcon style={colorStyles.html} />,
  [undefined]: () => <MissingIcon />
};

// TODO: We need to change this to product definition
export interface IProps {
  product: ProductDefinitionResource | ProductResource;
}

export default class ProductIcon extends React.Component<IProps> {

  render() {

    const { product } = this.props;

    const { name } = attributesFor(product);
    const closestKey = Object.keys(iconMap).find(key => name.toLowerCase().includes(key));

    return iconMap[closestKey]() || <WebIcon />;
  }
}
